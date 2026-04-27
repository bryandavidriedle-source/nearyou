import OpenAI from "openai";

import { aiChatSchema } from "@/lib/schemas";
import { applyRateLimit, enforceWriteOrigin, jsonError, jsonSuccess } from "@/lib/api";
import { serverEnv } from "@/lib/env";
import { getErrorMessage, logEvent } from "@/lib/monitoring";
import { getSupabaseAdminClient } from "@/lib/supabase/admin";
import { getSupabaseServerClient } from "@/lib/supabase/server";

const SYSTEM_PROMPT = `Tu es Assistant PrèsDeToi, assistant d'une marketplace locale suisse.
Objectifs:
- Répondre en français simple et rassurant.
- Aider l'utilisateur à choisir une catégorie de service.
- Expliquer le fonctionnement des réservations PrèsDeToi.
- Aider les prestataires sur l'onboarding.
- Si tu n'es pas certain, proposer un transfert vers support humain (email ou hotline).
Contraintes:
- Ne jamais inventer des prix exacts non confirmés. Utilise des formulations "dès".
- Rester concis, pratique, humain.
- Mentionner que PrèsDeToi est une plateforme intermédiaire et que les prestataires restent indépendants.`;

export async function POST(request: Request) {
  const originGuard = enforceWriteOrigin(request);
  if (originGuard) return originGuard;

  const limited = applyRateLimit(request, "ai");
  if (limited) return limited;

  if (!serverEnv.OPENAI_API_KEY) {
    return jsonError("Assistant temporairement indisponible. Clé OpenAI manquante.", 503);
  }

  const body = await request.json().catch(() => null);
  const parsed = aiChatSchema.safeParse(body);

  if (!parsed.success) {
    return jsonError("Message invalide.", 400, parsed.error.flatten().fieldErrors);
  }

  const supabaseServer = await getSupabaseServerClient();
  const {
    data: { user },
  } = await supabaseServer.auth.getUser();

  const supabaseAdmin = getSupabaseAdminClient();

  let conversationId = parsed.data.conversationId;

  if (!conversationId) {
    const { data: conversation, error: conversationError } = await supabaseAdmin
      .from("ai_conversations")
      .insert({
        profile_id: user?.id ?? null,
        status: "new",
        topic: "assistant-nearyou",
      })
      .select("id")
      .single();

    if (conversationError || !conversation) {
      return jsonError("Impossible de créer la conversation pour le moment.", 500);
    }

    conversationId = conversation.id;
  }

  await supabaseAdmin.from("ai_messages").insert({
    conversation_id: conversationId,
    role: "user",
    content: parsed.data.message,
  });

  const openai = new OpenAI({ apiKey: serverEnv.OPENAI_API_KEY });

  let assistantReply = "Je vous propose de passer au support humain pour vous aider rapidement.";
  try {
    const completion = await openai.responses.create({
      model: serverEnv.OPENAI_MODEL,
      input: [
        {
          role: "system",
          content: SYSTEM_PROMPT,
        },
        {
          role: "user",
          content: parsed.data.message,
        },
      ],
    });

    assistantReply = completion.output_text?.trim() || assistantReply;
  } catch (error) {
    logEvent("error", {
      event: "ai.chat.completion_failed",
      message: "OpenAI completion failed in assistant chat.",
      context: { reason: getErrorMessage(error), conversationId },
    });
  }

  await supabaseAdmin.from("ai_messages").insert({
    conversation_id: conversationId,
    role: "assistant",
    content: assistantReply,
  });

  return jsonSuccess("Réponse générée", {
    conversationId,
    reply: assistantReply,
  });
}

