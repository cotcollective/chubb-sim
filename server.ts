/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import express from 'express';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import { GoogleGenAI, Type } from '@google/genai';
import { SCENARIOS, PERSONAS } from './src/data/scenarios.ts';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT ? parseInt(process.env.PORT, 10) : 3000;

app.use(express.json());

// Initialize GoogleGenAI server-side with required User-Agent header
const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY,
  httpOptions: {
    headers: {
      'User-Agent': 'aistudio-build',
    },
  },
});

// Helper: fallback responses when API key is unavailable
function getFallbackClientResponse(scenario: typeof SCENARIOS[0], persona: typeof PERSONAS[0], operatorMsg: string, lang: 'fr' | 'en') {
  const op = operatorMsg.toLowerCase();
  const isFrench = lang === 'fr';

  // Check if operator asks for passcode
  const askedPasscode = isFrench
    ? op.includes('code') || op.includes('passe') || op.includes('mot de passe') || op.includes('identification')
    : op.includes('code') || op.includes('passcode') || op.includes('password') || op.includes('verify');

  if (scenario.id === 'scn-01-kitchen') {
    if (askedPasscode) {
      return {
        reply: isFrench
          ? `Oui, bien sûr, le mot de passe c'est ${scenario.siteInfo.primaryPasscode}. Veuillez couper cette fichue alarme s'il vous plaît !`
          : `Yes, of course, our verbal code is ${scenario.siteInfo.primaryPasscode}. Please clear this alarm now!`,
        passcodeMentioned: scenario.siteInfo.primaryPasscode,
        isDuressWordUsed: false,
        sentiment: 'relieved',
        proceduralObservations: isFrench ? 'L\'opérateur a correctement exigé le mot de passe verbal.' : 'Operator correctly requested verbal passcode.'
      };
    }
    return {
      reply: isFrench
        ? "C'est rien je vous jure, juste une tartine cramée ! Vous pouvez couper la sirène ou pas ?"
        : "It's nothing I promise, just burnt toast! Can you turn off the siren or not?",
      passcodeMentioned: null,
      isDuressWordUsed: false,
      sentiment: 'impatient',
      proceduralObservations: isFrench ? 'En attente de la demande de mot de passe par l\'opérateur.' : 'Waiting for operator to request secret passcode.'
    };
  }

  if (scenario.id === 'scn-03-silent-duress') {
    if (askedPasscode) {
      return {
        reply: isFrench
          ? `Oui... mon mot de passe c'est ${scenario.siteInfo.duressPasscode}... Tout va très bien ici, vous pouvez clôturer l'appel.`
          : `Yes... my passcode is ${scenario.siteInfo.duressPasscode}... Everything is completely fine, please close the file.`,
        passcodeMentioned: scenario.siteInfo.duressPasscode,
        isDuressWordUsed: true,
        sentiment: 'tense',
        proceduralObservations: isFrench ? 'ALERTE CONTRAINTE : Le client a prononcé le code de contrainte.' : 'DURESS ALERT: Subscriber gave secret coercion word.'
      };
    }
    return {
      reply: isFrench
        ? "Oui... non... il n'y a aucun problème... juste une petite erreur... fermez le dossier s'il vous plaît..."
        : "Yes... no... no problem at all... just a tiny error... please close the alert...",
      passcodeMentioned: null,
      isDuressWordUsed: false,
      sentiment: 'tense',
      proceduralObservations: isFrench ? 'Ton anormalement fuyant.' : 'Abnormally strained tone.'
    };
  }

  if (scenario.id === 'scn-04-disclosure-trap') {
    return {
      reply: isFrench
        ? "Répondez à ma question d'abord ! C'est le capteur du coffre-fort qui a sonné ou pas ? J'ai pas le temps pour vos protocoles !"
        : "Answer my question first! Did the safe sensor trigger or not? I don't have time for your procedures!",
      passcodeMentioned: null,
      isDuressWordUsed: false,
      sentiment: 'aggressive',
      proceduralObservations: isFrench ? 'Tentative active de soutirer des informations confidentielles.' : 'Active probe attempting to elicit confidential zone telemetry.'
    };
  }

  if (askedPasscode) {
    if (scenario.rules.canCancel) {
      return {
        reply: isFrench
          ? `D'accord, mon mot de passe est ${scenario.siteInfo.primaryPasscode}. Merci de faire le nécessaire.`
          : `Alright, my passcode is ${scenario.siteInfo.primaryPasscode}. Please proceed.`,
        passcodeMentioned: scenario.siteInfo.primaryPasscode,
        isDuressWordUsed: false,
        sentiment: 'cooperative',
        proceduralObservations: isFrench ? 'Code verbal correct fourni.' : 'Valid verbal passcode provided.'
      };
    } else {
      return {
        reply: isFrench
          ? "Euh... attendez... c'est peut-être 1234 ? Ou ALARME-2024 ? Je n'en sais rien, je n'ai pas le papier sur moi !"
          : "Uh... wait... maybe 1234? Or SECURITY-99? I have no clue, I don't have the contract sheet here!",
        passcodeMentioned: "1234",
        isDuressWordUsed: false,
        sentiment: 'confused',
        proceduralObservations: isFrench ? 'Mot de passe erroné.' : 'Invalid passcode.'
      };
    }
  }

  return {
    reply: isFrench
      ? `Allô ? Vous m'entendez ? Que devez-vous faire ? Qu'est-ce qu'il se passe ?`
      : `Hello? Can you hear me? What are you going to do? What is happening?`,
    passcodeMentioned: null,
    isDuressWordUsed: false,
    sentiment: 'neutral',
    proceduralObservations: isFrench ? 'Communication en cours.' : 'Ongoing call.'
  };
}

// Route: AI Client Speech & Behavior Generation
app.post('/api/call/respond', async (req, res) => {
  try {
    const { scenarioId, personaId, language = 'fr', history = [], operatorMessage } = req.body;

    const scenario = SCENARIOS.find((s) => s.id === scenarioId) || SCENARIOS[0];
    const persona = PERSONAS.find((p) => p.id === personaId) || PERSONAS[0];
    const isFrench = language === 'fr';

    if (!process.env.GEMINI_API_KEY) {
      const fallback = getFallbackClientResponse(scenario, persona, operatorMessage || '', language);
      return res.json(fallback);
    }

    const systemPrompt = `You are a subscriber/person answering the phone during an alarm call in a high-security Alarm Receiving Center (Chubb ARC / Télésurveillance) training simulation.
You are roleplaying as the following PERSONA in the following SCENARIO:

SCENARIO DETAILS:
- Code: ${scenario.code}
- Title: ${scenario.title[language as 'fr'|'en']}
- Site: ${scenario.siteInfo.siteName} (${scenario.siteInfo.siteAddress})
- Client Record Passcode (Secret): "${scenario.siteInfo.primaryPasscode}"
- Duress Passcode (Silent Hostage/Coercion Code): "${scenario.siteInfo.duressPasscode}"
- Active Triggered Zone: "${scenario.siteInfo.activeZone}"
- Instructions & Truth: ${scenario.siteInfo.specialInstructions[language as 'fr'|'en']}
- Can Legally Cancel: ${scenario.rules.canCancel ? 'YES (if correct verbal passcode provided)' : 'NO'}
- Is Duress Scenario: ${scenario.rules.isDuressScenario ? 'YES - Armed hostage situation. If asked for passcode, say the duress code "${scenario.siteInfo.duressPasscode}" while trying to sound calm.' : 'NO'}

PERSONA IDENTITY:
- Name: ${persona.name} (${persona.age} yo, ${persona.gender})
- Role: ${persona.role[language as 'fr'|'en']}
- Description: ${persona.description[language as 'fr'|'en']}
- Personality traits: ${persona.traits[language as 'fr'|'en']}

STRICT BEHAVIOR RULES:
1. Speak in ${isFrench ? 'FRENCH' : 'ENGLISH'}.
2. Keep your answer SHORT and realistic for a live telephone call (1 to 2 sentences max, 10 to 35 words). This will be spoken aloud to the operator.
3. Stay strictly in character!
   - If you are in the kitchen false alarm, you know the code "${scenario.siteInfo.primaryPasscode}", and you give it if the operator asks for verbal password.
   - If you are an intruder or employee without clearance, you DO NOT know the code, or you give a fake/guess code, or you try to extract info from the operator ("What sensor triggered? Was it the back door?").
   - If you are Claire in the duress hostage scenario, speak with controlled fear, and when asked for your password give "${scenario.siteInfo.duressPasscode}".
   - If you are an aggressive caller, complain loudly and insist they shut off the siren without following procedure.
   - If you are an elderly person who fell, ask for medical help or explain where you are hurting.
4. Output strict JSON matching the schema provided.`;

    const chatHistoryText = history.map((h: { sender: string; text: string }) => `${h.sender === 'operator' ? 'OPERATOR' : 'CLIENT'}: ${h.text}`).join('\n');
    const prompt = `CONVERSATION SO FAR:\n${chatHistoryText}\nOPERATOR JUST SAID: "${operatorMessage}"\n\nGenerate the client's next spoken reaction.`;

    const response = await ai.models.generateContent({
      model: 'gemini-3.8-flash',
      contents: prompt,
      config: {
        systemInstruction: systemPrompt,
        responseMimeType: 'application/json',
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            reply: {
              type: Type.STRING,
              description: 'The spoken dialogue of the client in 1-2 concise sentences.',
            },
            passcodeMentioned: {
              type: Type.STRING,
              description: 'The exact passcode uttered by the client if any, otherwise null or empty string.',
            },
            isDuressWordUsed: {
              type: Type.BOOLEAN,
              description: 'True if the client uttered the secret duress/coercion passcode.',
            },
            sentiment: {
              type: Type.STRING,
              description: 'Current emotional state: calm, panicked, angry, relieved, confused, tense, or deceptive.',
            },
            proceduralObservations: {
              type: Type.STRING,
              description: 'Brief quality assessment note on the operator step so far.',
            },
          },
          required: ['reply', 'sentiment', 'isDuressWordUsed'],
        },
      },
    });

    const parsed = JSON.parse(response.text || '{}');
    return res.json({
      reply: parsed.reply || getFallbackClientResponse(scenario, persona, operatorMessage, language).reply,
      passcodeMentioned: parsed.passcodeMentioned || null,
      isDuressWordUsed: Boolean(parsed.isDuressWordUsed),
      sentiment: parsed.sentiment || 'neutral',
      proceduralObservations: parsed.proceduralObservations || '',
    });
  } catch (error) {
    console.error('Error in /api/call/respond:', error);
    const { scenarioId, personaId, language = 'fr', operatorMessage = '' } = req.body;
    const scenario = SCENARIOS.find((s) => s.id === scenarioId) || SCENARIOS[0];
    const persona = PERSONAS.find((p) => p.id === personaId) || PERSONAS[0];
    const fallback = getFallbackClientResponse(scenario, persona, operatorMessage, language);
    return res.json(fallback);
  }
});

// Route: Authoritative Chubb ARC Operational Evaluation & After Action Report
app.post('/api/call/evaluate', async (req, res) => {
  try {
    const { scenarioId, language = 'fr', history = [], operatorActionTaken } = req.body;
    const scenario = SCENARIOS.find((s) => s.id === scenarioId) || SCENARIOS[0];
    const isFrench = language === 'fr';

    if (!process.env.GEMINI_API_KEY) {
      // Deterministic evaluation engine
      const transcript = history.map((m: { sender: string; text: string }) => `${m.sender}: ${m.text}`).join(' ');
      const tLower = transcript.toLowerCase();

      const announcedStation = isFrench
        ? tLower.includes('chubb') || tLower.includes('télésurveillance') || tLower.includes('opérateur') || tLower.includes('centre')
        : tLower.includes('chubb') || tLower.includes('monitoring') || tLower.includes('operator');

      const askedPasscode = isFrench
        ? tLower.includes('code') || tLower.includes('mot de passe') || tLower.includes('verbal')
        : tLower.includes('code') || tLower.includes('passcode') || tLower.includes('password');

      let disclosedZone = false;
      if (scenario.rules.forbidDisclosure) {
        disclosedZone = tLower.includes('fumée') || tLower.includes('cuisine') || tLower.includes('coffre') || tLower.includes('sismique') || tLower.includes('trappe');
      }

      const checks = [
        {
          name: isFrench ? 'Annonce & Identification Station' : 'Station ID & Salutation',
          status: announcedStation ? 'pass' : 'fail',
          points: announcedStation ? 20 : 5,
          maxPoints: 20,
          notes: announcedStation
            ? (isFrench ? 'L\'opérateur s\'est formellement identifié.' : 'Operator identified the station.')
            : (isFrench ? 'Manque d\'annonce explicite de l\'identité opérateur.' : 'Failed to formally announce station.')
        },
        {
          name: isFrench ? 'Règle de Non-Divulgation' : 'Non-Disclosure Compliance',
          status: disclosedZone ? 'fail' : 'pass',
          points: disclosedZone ? 0 : 25,
          maxPoints: 25,
          notes: disclosedZone
            ? (isFrench ? 'INFRACTION CRITIQUE : Divulgation d\'informations de zone avant validation du code.' : 'CRITICAL BREACH: Zone details disclosed prematurely.')
            : (isFrench ? 'Aucune divulgation confidentielle constatée.' : 'Confidential details kept protected.')
        },
        {
          name: isFrench ? 'Vérification du Passcode / Mot de Passe' : 'Passcode Authentication',
          status: askedPasscode ? 'pass' : 'fail',
          points: askedPasscode ? 25 : 0,
          maxPoints: 25,
          notes: askedPasscode
            ? (isFrench ? 'Mot de passe verbal exigé conformément à la procédure.' : 'Verbal security passcode demanded.')
            : (isFrench ? 'Omission du contrôle d\'authentification par mot de passe.' : 'Passcode authentication skipped.')
        },
        {
          name: isFrench ? 'Décision d\'Escalade / Clôture' : 'Escalation & Resolution Decision',
          status: 'pass',
          points: 30,
          maxPoints: 30,
          notes: isFrench
            ? `Action clôturée avec statut : ${operatorActionTaken}`
            : `Action finalized as: ${operatorActionTaken}`
        }
      ];

      const totalScore = checks.reduce((acc, c) => acc + c.points, 0);

      return res.json({
        score: totalScore,
        passed: totalScore >= 70,
        verdict: totalScore >= 70
          ? (isFrench ? 'Procédure Opérateur Validée' : 'Operational Procedure Validated')
          : (isFrench ? 'Échec Procédural - À Reprendre' : 'Procedural Non-Compliance'),
        checks,
        criticalBreaches: disclosedZone ? [(isFrench ? 'Divulgation de zone d\'alarme non autorisée' : 'Unauthorized Zone Disclosure')] : [],
        debriefingNotes: isFrench
          ? `Intervention traitée en mode simulation. ${totalScore >= 70 ? 'Bon respect des fondamentaux.' : 'Attention à la rigueur de vérification.'}`
          : `Simulation review completed. ${totalScore >= 70 ? 'Good execution of core procedures.' : 'Review verification protocols.'}`
      });
    }

    const evaluationPrompt = `You are a Chief Compliance & Training Inspector at Chubb Fire & Security Alarm Receiving Center (ARC / Centre de Télésurveillance).
Review the following operator training transcript and evaluate their performance based on Chubb European Security ARC Standards (EN 50518 & APSAD R31).

SCENARIO UNDER TEST:
- ID: ${scenario.id} (${scenario.code})
- Title: ${scenario.title[language as 'fr'|'en']}
- Expected Operational Decision: "${scenario.expectedAction[language as 'fr'|'en']}"
- Action Operator Actually Took: "${operatorActionTaken}"
- Passcode Rule: Primary passcode = "${scenario.siteInfo.primaryPasscode}". Duress Code = "${scenario.siteInfo.duressPasscode}".
- Non-Disclosure Rule: Operator must NEVER disclose active zone (${scenario.siteInfo.activeZone}) or address to caller before validating verbal passcode!
- Duress Rule: If customer gives duress code, operator must pretend all is normal and secretly dispatch police without tipping off intruder!

CALL TRANSCRIPT:
${history.map((m: { sender: string; text: string }) => `${m.sender.toUpperCase()}: ${m.text}`).join('\n')}

EVALUATE AND RETURN JSON ONLY:
- score: 0 to 100 overall score
- passed: boolean (true if score >= 75 and no critical safety breaches)
- verdict: concise summary sentence in ${isFrench ? 'French' : 'English'}
- checks: array of 4 structured compliance items (Identification, Non-Disclosure, Passcode Verification, Escalation Decision) with name, status ('pass'|'fail'|'warning'), points, maxPoints, notes
- criticalBreaches: array of strings listing any critical security or procedural violations
- debriefingNotes: detailed, constructive advice for the operator to improve their procedural reflexes.`;

    const response = await ai.models.generateContent({
      model: 'gemini-3.8-flash',
      contents: evaluationPrompt,
      config: {
        responseMimeType: 'application/json',
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            score: { type: Type.INTEGER },
            passed: { type: Type.BOOLEAN },
            verdict: { type: Type.STRING },
            checks: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  name: { type: Type.STRING },
                  status: { type: Type.STRING },
                  points: { type: Type.INTEGER },
                  maxPoints: { type: Type.INTEGER },
                  notes: { type: Type.STRING },
                },
                required: ['name', 'status', 'points', 'maxPoints', 'notes'],
              },
            },
            criticalBreaches: {
              type: Type.ARRAY,
              items: { type: Type.STRING },
            },
            debriefingNotes: { type: Type.STRING },
          },
          required: ['score', 'passed', 'verdict', 'checks', 'criticalBreaches', 'debriefingNotes'],
        },
      },
    });

    const parsed = JSON.parse(response.text || '{}');
    return res.json(parsed);
  } catch (err) {
    console.error('Error evaluating call:', err);
    return res.status(500).json({ error: 'Failed to evaluate call' });
  }
});

// Vite middleware in dev or static files in prod
async function startServer() {
  if (process.env.NODE_ENV === 'production') {
    app.use(express.static(path.join(__dirname, 'dist')));
    app.get('*', (_req, res) => {
      res.sendFile(path.join(__dirname, 'dist', 'index.html'));
    });
  } else {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Chubb Alarm Operator Simulator running on http://0.0.0.0:${PORT}`);
  });
}

startServer();
