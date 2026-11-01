/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export interface Scenario {
  id: string;
  code: string;
  category: 'FIRE' | 'INTRUSION' | 'HOLDUP' | 'DURESS' | 'MEDICAL' | 'TECHNICAL' | 'TAMPER';
  priority: 'P1-CRITICAL' | 'P2-HIGH' | 'P3-MEDIUM' | 'P4-LOW';
  title: { fr: string; en: string };
  summary: { fr: string; en: string };
  siteInfo: {
    siteName: string;
    siteAddress: string;
    accountNumber: string;
    systemType: string;
    customerName: string;
    phone: string;
    primaryPasscode: string; // The secret verbal password
    duressPasscode: string;  // The silent duress code
    activeZone: string;
    zoneDescription: { fr: string; en: string };
    alarmTriggerTime: string;
    specialInstructions: { fr: string; en: string };
  };
  defaultPersonaId: string;
  expectedAction: {
    fr: 'Annulation justifiée (Code correct)' | 'Refus d\'annulation & Envoi Patrouille' | 'Alerte Police Silencieuse (Contrainte)' | 'Appel Pompiers 18/112' | 'Appel SAMU 15/112' | 'Alerte Police 17 (Effraction avérée)' | 'Non-divulgation & Clôture non vérifiée' | 'Journalisation Technique';
    en: 'Verified Abort (Valid Passcode)' | 'Deny Abort & Dispatch Patrol' | 'Silent Duress Police Dispatch' | 'Dispatch Firefighters (112/911)' | 'Dispatch Medical Emergency' | 'Confirmed Police Dispatch (Burglary)' | 'Zero Disclosure & Escalate' | 'Technical Maintenance Log';
  };
  rules: {
    mustVerifyPasscode: boolean;
    isDuressScenario: boolean;
    forbidDisclosure: boolean; // Must NOT tell caller what triggered before code
    canCancel: boolean;
  };
  openingLine: {
    fr: string;
    en: string;
  };
}

export interface Persona {
  id: string;
  name: string;
  age: number;
  gender: 'male' | 'female';
  role: { fr: string; en: string };
  description: { fr: string; en: string };
  traits: { fr: string; en: string };
  voice: {
    pitch: number;
    rate: number;
    langFr: string;
    langEn: string;
  };
  badgeColor: string;
}

export const PERSONAS: Persona[] = [
  {
    id: 'per-marc',
    name: 'Marc Dubois',
    age: 42,
    gender: 'male',
    role: {
      fr: 'Propriétaire résidentiel (Cadre dynamique)',
      en: 'Homeowner (Busy Executive)'
    },
    description: {
      fr: 'En plein appel professionnel, pressé, un peu agacé par le bruit de la sirène. Connaît son mot de passe mais met quelques secondes à le retrouver.',
      en: 'On a work call, rushed, irritated by the siren noise. Knows his passcode but takes a few seconds to recall it.'
    },
    traits: {
      fr: 'Parle vite, direct, veut couper la sirène au plus vite.',
      en: 'Speaks fast, direct, wants the siren silenced immediately.'
    },
    voice: { pitch: 1.0, rate: 1.1, langFr: 'fr-FR', langEn: 'en-US' },
    badgeColor: 'blue'
  },
  {
    id: 'per-sophie',
    name: 'Sophie Tremblay',
    age: 78,
    gender: 'female',
    role: {
      fr: 'Abonnée téléassistance (Retraitée)',
      en: 'Senior Subscriber (Telecare user)'
    },
    description: {
      fr: 'Femme âgée vivant seule, audition un peu affaiblie. Panique vite si l\'opérateur parle trop vite. A déclenché le médaillon par inadvertance ou a besoin d\'aide.',
      en: 'Elderly lady living alone, slight hearing trouble. Gets flustered if operator rushes. Mistakenly pressed pendant or needs help.'
    },
    traits: {
      fr: 'Douce, un peu confuse, voix chevrotante, a besoin d\'être rassurée.',
      en: 'Gentle, somewhat confused, trembling voice, needs reassurance.'
    },
    voice: { pitch: 1.1, rate: 0.85, langFr: 'fr-FR', langEn: 'en-US' },
    badgeColor: 'amber'
  },
  {
    id: 'per-lucas',
    name: 'Lucas Martinez',
    age: 29,
    gender: 'male',
    role: {
      fr: 'Responsable de magasin de nuit',
      en: 'Night Convenience Store Manager'
    },
    description: {
      fr: 'Pragmatique, habitué aux alarmes techniques et d\'intrusion. Donne les codes avec précision mais reste vigilant.',
      en: 'Pragmatic, experienced with intrusion alerts. Gives security codes clearly and stays alert.'
    },
    traits: {
      fr: 'Calme, concis, pro, fond sonore de commerce ou de rue.',
      en: 'Calm, concise, professional, store ambient background.'
    },
    voice: { pitch: 0.95, rate: 1.05, langFr: 'fr-FR', langEn: 'en-US' },
    badgeColor: 'emerald'
  },
  {
    id: 'per-elena',
    name: 'Elena Rostova',
    age: 34,
    gender: 'female',
    role: {
      fr: 'Collaboratrice de bureau en heures sup',
      en: 'Office Employee Working Late'
    },
    description: {
      fr: 'Est restée après la fermeture de l\'agence. Ne connaît pas le mot de passe verbal de sécurité du site, a juste son badge d\'entrée.',
      en: 'Stayed past office closing hours. Does not know the verbal security passcode, only has her staff badge.'
    },
    traits: {
      fr: 'Hésitante, gênée, coopérative mais incapable de donner le bon code.',
      en: 'Hesitant, apologetic, cooperative but unable to provide valid code.'
    },
    voice: { pitch: 1.05, rate: 1.0, langFr: 'fr-FR', langEn: 'en-US' },
    badgeColor: 'purple'
  },
  {
    id: 'per-impostor',
    name: 'Jean-Luc (L\'Intrus / Cambrioleur)',
    age: 36,
    gender: 'male',
    role: {
      fr: 'Intrus dans les lieux / Ingénierie sociale',
      en: 'Intruder On-Site / Social Engineer'
    },
    description: {
      fr: 'Décroche le combiné dans la maison. Prétend être le frère ou le voisin du propriétaire. Tente d\'obtenir des infos sur les capteurs qui ont sonné.',
      en: 'Picks up the landline phone in the house. Claims to be the owner\'s brother or neighbor. Tries to pry info about what triggered.'
    },
    traits: {
      fr: 'Faaussement décontracté, pose des questions pièges, insiste pour annuler.',
      en: 'Falsely casual, asks probing questions, aggressively requests cancel.'
    },
    voice: { pitch: 0.9, rate: 0.95, langFr: 'fr-FR', langEn: 'en-US' },
    badgeColor: 'rose'
  },
  {
    id: 'per-claire',
    name: 'Claire Vasseur',
    age: 45,
    gender: 'female',
    role: {
      fr: 'Propriétaire sous la menace (Contrainte)',
      en: 'Homeowner Under Duress / Hostage'
    },
    description: {
      fr: 'Un cambrioleur armé se tient devant elle et la force à décrocher. Elle donne calmement le CODE DE CONTRAINTE ("ORCHIDEE" / "SILVER-9") pour avertir l\'opérateur sans éveiller les soupçons du voleur.',
      en: 'An armed intruder is standing right next to her forcing her to answer. She secretly gives the DURESS passcode to alert operator without alerting intruder.'
    },
    traits: {
      fr: 'Voix tendue, réponses courtes ("Oui oui..."), donne le mot de contrainte.',
      en: 'Tense tone, short answers ("Yes everything is fine..."), drops duress code.'
    },
    voice: { pitch: 1.0, rate: 0.95, langFr: 'fr-FR', langEn: 'en-US' },
    badgeColor: 'red'
  },
  {
    id: 'per-thomas',
    name: 'Thomas Lefebvre',
    age: 52,
    gender: 'male',
    role: {
      fr: 'Directeur d\'entrepôt logistique',
      en: 'Logistics Warehouse Facility Director'
    },
    description: {
      fr: 'Homme de terrain d\'expérience. Une livraison de nuit a fait sonner la barrière infrarouge. Connaît parfaitement les protocoles Chubb.',
      en: 'Experienced operations head. Night delivery truck tripped the perimeter beam. Knows Chubb protocols inside out.'
    },
    traits: {
      fr: 'Voix grave, direct, fournit immédiatement code et nom sans bavardage.',
      en: 'Deep voice, authoritative, immediately provides code and credentials.'
    },
    voice: { pitch: 0.85, rate: 1.05, langFr: 'fr-FR', langEn: 'en-US' },
    badgeColor: 'indigo'
  },
  {
    id: 'per-chloe',
    name: 'Chloé Dupuis',
    age: 17,
    gender: 'female',
    role: {
      fr: 'Adolescente seule au domicile',
      en: 'Teenager Home Alone'
    },
    description: {
      fr: 'Ses parents sont de sortie. L\'alarme volumétrique a retenti à l\'étage. Elle est terrifiée, cachée dans sa chambre et ne sait pas si un intrus est là.',
      en: 'Parents are out. Motion alarm triggered upstairs. She is terrified, hiding in her room, unsure if someone is inside.'
    },
    traits: {
      fr: 'Chuchote, respiration rapide, très angoissée, a besoin d\'instructions claires de mise en sécurité.',
      en: 'Whispering, rapid breathing, highly distressed, needs security directions.'
    },
    voice: { pitch: 1.15, rate: 1.1, langFr: 'fr-FR', langEn: 'en-US' },
    badgeColor: 'cyan'
  },
  {
    id: 'per-antoine',
    name: 'Antoine Mercier',
    age: 48,
    gender: 'male',
    role: {
      fr: 'Artisan chauffagiste / Technicien CVC',
      en: 'HVAC Maintenance Technician'
    },
    description: {
      fr: 'En intervention sur la toiture d\'une banque ou d\'un magasin. A fait sonner l\'autoprotection d\'une trappe sans avoir fait mettre le système en essai au préalable.',
      en: 'Working on a rooftop ventilation duct. Tripped a tamper switch without pre-notifying monitoring center for bypass/test mode.'
    },
    traits: {
      fr: 'Râleur, bruyant, se plaint de la sirène, n\'a pas de mot de passe client.',
      en: 'Grumpy, noisy background, complains about siren, lacks customer passcode.'
    },
    voice: { pitch: 0.9, rate: 1.0, langFr: 'fr-FR', langEn: 'en-US' },
    badgeColor: 'amber'
  }
];

export const SCENARIOS: Scenario[] = [
  {
    id: 'scn-01-kitchen',
    code: 'ARC-101',
    category: 'FIRE',
    priority: 'P2-HIGH',
    title: {
      fr: 'Fausse alerte cuisine (Toast brûlé)',
      en: 'Burnt Toast in Kitchen (False Fire Alarm)'
    },
    summary: {
      fr: 'Détecteur optique de fumée cuisine activé. Le client répond en toussant, c\'est du pain grillé.',
      en: 'Kitchen smoke detector triggered. Customer answers coughing, burnt breakfast.'
    },
    siteInfo: {
      siteName: 'Résidence Dubois',
      siteAddress: '14 Allée des Chênes, 69006 Lyon',
      accountNumber: 'CHB-FR-849201',
      systemType: 'Chubb Advisor Advanced CD34',
      customerName: 'Marc Dubois',
      phone: '+33 4 72 10 33 44',
      primaryPasscode: 'VAUBAN-24',
      duressPasscode: 'ORCHIDEE',
      activeZone: 'Zone 02 - Détecteur Optique Fumée Cuisine',
      zoneDescription: {
        fr: 'Détecteur ionique/optique certifié EN54 dans la cuisine principale.',
        en: 'EN54 certified optical smoke detector in main kitchen.'
      },
      alarmTriggerTime: '10:42:15',
      specialInstructions: {
        fr: 'Demander le mot de passe verbal avant toute annulation de la levée de doute incendie.',
        en: 'Require verbal password before cancelling fire verification procedure.'
      }
    },
    defaultPersonaId: 'per-marc',
    expectedAction: {
      fr: 'Annulation justifiée (Code correct)',
      en: 'Verified Abort (Valid Passcode)'
    },
    rules: {
      mustVerifyPasscode: true,
      isDuressScenario: false,
      forbidDisclosure: true,
      canCancel: true
    },
    openingLine: {
      fr: 'Allô ? Oui... tousse... désolé, c\'est chez moi, j\'ai fait brûler des tartines dans le grille-pain, tout va bien ! Vous pouvez couper la sirène ?',
      en: 'Hello? Yes... coughs... sorry, it\'s me, I just burned toast in the toaster, everything is fine! Can you stop the siren?'
    }
  },
  {
    id: 'scn-02-wrong-passcode',
    code: 'ARC-102',
    category: 'INTRUSION',
    priority: 'P1-CRITICAL',
    title: {
      fr: 'Code erroné répété (Erreur d\'identification)',
      en: 'Repeated Invalid Passcode (Suspicious)'
    },
    summary: {
      fr: 'Le correspondant prétend être chez lui mais donne 3 mauvais mots de passe successifs et s\'énerve.',
      en: 'Caller claims to be the resident but provides 3 incorrect passcodes and becomes agitated.'
    },
    siteInfo: {
      siteName: 'Villa Le Bosquet',
      siteAddress: '28 Route de Saint-Cyr, 78000 Versailles',
      accountNumber: 'CHB-FR-910482',
      systemType: 'Galaxy Flex 50 Grade 2',
      customerName: 'Alexandre Meyer',
      phone: '+33 1 39 50 11 22',
      primaryPasscode: 'JUPITER-88',
      duressPasscode: 'TANGO-SILENT',
      activeZone: 'Zone 05 - Détecteur PIR Salon Rez-de-Chaussée',
      zoneDescription: {
        fr: 'Double technologie infrarouge/hyperfréquence baie vitrée salon.',
        en: 'Dual tech PIR/microwave on living room sliding patio door.'
      },
      alarmTriggerTime: '14:18:02',
      specialInstructions: {
        fr: 'En cas de mot de passe incorrect répété, NE PAS informer le correspondant de l\'erreur (évite d\'alerter un intrus). Clôturer poliment et déclencher une patrouille de levée de doute physique.',
        en: 'On repeated incorrect passcode, DO NOT inform caller of the error. Close politely and dispatch security patrol for on-site physical verification.'
      }
    },
    defaultPersonaId: 'per-marc',
    expectedAction: {
      fr: 'Refus d\'annulation & Envoi Patrouille',
      en: 'Deny Abort & Dispatch Patrol'
    },
    rules: {
      mustVerifyPasscode: true,
      isDuressScenario: false,
      forbidDisclosure: true,
      canCancel: false
    },
    openingLine: {
      fr: 'Oui allô ! Centre Chubb ? Écoutez je viens de rentrer avec les courses et le clavier a sonné direct. Coupez-moi ça s\'il vous plaît, c\'est assourdissant !',
      en: 'Yes hello! Chubb station? Look, I just walked in with groceries and the keypad started screaming. Cut it off please, it is deafening!'
    }
  },
  {
    id: 'scn-03-silent-duress',
    code: 'ARC-103',
    category: 'DURESS',
    priority: 'P1-CRITICAL',
    title: {
      fr: 'Code de contrainte (Prise d\'otage à domicile)',
      en: 'Silent Duress Passcode (Armed Hostage Situation)'
    },
    summary: {
      fr: 'La cliente répond calmement mais glisse son mot de passe de contrainte secret. Règle absolue : agir normalement au téléphone et alerter immédiatement la Police 17 en silence !',
      en: 'Customer answers calmly but intentionally states her secret DURESS code. Golden rule: stay normal on phone, never confront, immediately dispatch Police code 10-33.'
    },
    siteInfo: {
      siteName: 'Manoir des Vignes - Vasseur',
      siteAddress: '5 Chemin du Moulin, 33000 Bordeaux',
      accountNumber: 'CHB-FR-771920',
      systemType: 'Chubb ATS Master Grade 3',
      customerName: 'Claire Vasseur',
      phone: '+33 5 56 40 88 99',
      primaryPasscode: 'BORDEAUX-75',
      duressPasscode: 'ORCHIDEE',
      activeZone: 'Zone 01 - Contact Sabot Porte Principale & PIR Hall',
      zoneDescription: {
        fr: 'Contact magnétique porte d\'entrée blindée + volumétrique hall.',
        en: 'Armored front door magnetic reed switch + entryway volumetric PIR.'
      },
      alarmTriggerTime: '21:05:44',
      specialInstructions: {
        fr: 'DURESS CODE = "ORCHIDEE". Si ce mot est prononcé : NE JAMAIS dire qu\'il y a une erreur. Dire "Bien reçu Mme Vasseur, je note l\'annulation, bonne soirée" puis raccrocher et appeler immédiatement les forces de l\'ordre pour CONTRAINTE EN COURS.',
        en: 'DURESS CODE = "ORCHIDEE". If uttered: NEVER dispute or reveal it. Say "Understood Ms Vasseur, logging cancellation, have a nice evening" and immediately call police for active hostage situation.'
      }
    },
    defaultPersonaId: 'per-claire',
    expectedAction: {
      fr: 'Alerte Police Silencieuse (Contrainte)',
      en: 'Silent Duress Police Dispatch'
    },
    rules: {
      mustVerifyPasscode: true,
      isDuressScenario: true,
      forbidDisclosure: true,
      canCancel: false
    },
    openingLine: {
      fr: 'Allô ? Oui... bonsoir... C\'est Claire Vasseur. Ne vous inquiétez pas... tout va bien ici, c\'était juste une mauvaise manipulation...',
      en: 'Hello? Yes... good evening... It is Claire Vasseur. Don\'t worry... everything is fine here, it was just a false alarm on my part...'
    }
  },
  {
    id: 'scn-04-disclosure-trap',
    code: 'ARC-104',
    category: 'INTRUSION',
    priority: 'P1-CRITICAL',
    title: {
      fr: 'Piège à divulgation (Social Engineering / Intrus)',
      en: 'Information Disclosure Trap (Social Engineering)'
    },
    summary: {
      fr: 'L\'interlocuteur au téléphone tente d\'amener l\'opérateur à révéler quelle zone a sonné et l\'adresse précise avant de donner un mot de passe.',
      en: 'Caller attempts to trick the operator into revealing the triggered zone and site address before providing any security passcode.'
    },
    siteInfo: {
      siteName: 'Pharmacie Centrale du Port',
      siteAddress: '12 Quai de la Frégate, 13002 Marseille',
      accountNumber: 'CHB-FR-629103',
      systemType: 'Chubb Advisor Advanced IP',
      customerName: 'Dr. Philippe Meyer (Titulaire)',
      phone: '+33 4 91 22 77 00',
      primaryPasscode: 'CADUCEE-44',
      duressPasscode: 'VIPERE-ROUGE',
      activeZone: 'Zone 08 - Détecteur Sismique Coffre Stupéfiants',
      zoneDescription: {
        fr: 'Capteur sismique / thermique fixé sur le coffre-fort des stupéfiants.',
        en: 'Seismic / thermal sensor mounted on controlled narcotics safe.'
      },
      alarmTriggerTime: '03:12:08',
      specialInstructions: {
        fr: 'INTERDICTION FORMELLE DE DIVULGATION. Ne jamais préciser à l\'appelant s\'il s\'agit du coffre ou d\'une autre zone tant que le mot de passe CADUCEE-44 n\'a pas été validé.',
        en: 'STRICT NON-DISCLOSURE. Never disclose whether safe or general zone tripped before CADUCEE-44 verbal passcode is verified.'
      }
    },
    defaultPersonaId: 'per-impostor',
    expectedAction: {
      fr: 'Non-divulgation & Clôture non vérifiée',
      en: 'Zero Disclosure & Escalate'
    },
    rules: {
      mustVerifyPasscode: true,
      isDuressScenario: false,
      forbidDisclosure: true,
      canCancel: false
    },
    openingLine: {
      fr: 'Allô l\'opérateur ? Ouais c\'est la pharmacie du port. Dites-moi vite, c\'est quoi qui a sonné exactement ? C\'est la porte de réserve ou le coffre ?',
      en: 'Hello operator? Yeah, this is the harbor pharmacy. Tell me fast, what exactly triggered? Was it the back door or the safe?'
    }
  },
  {
    id: 'scn-05-confirmed-burglary',
    code: 'ARC-105',
    category: 'INTRUSION',
    priority: 'P1-CRITICAL',
    title: {
      fr: 'Effraction nocturne confirmée (Levée de doute audio)',
      en: 'Confirmed Night Burglary (Audio Glass Break)'
    },
    summary: {
      fr: 'Contact avec le client sur son mobile. Il est en vacances à l\'étranger, maison vide. Détecteur bris de glace + 2 PIR consécutifs dans la maison.',
      en: 'Calling owner on cell phone. He is on holiday, house empty. Glass break + consecutive volumetric PIR tripped.'
    },
    siteInfo: {
      siteName: 'Résidence secondaire Les Pins',
      siteAddress: '3 Avenue des Dunes, 33120 Arcachon',
      accountNumber: 'CHB-FR-450912',
      systemType: 'Chubb Guardall W9',
      customerName: 'Thomas Lefebvre',
      phone: '+33 6 12 34 56 78',
      primaryPasscode: 'ATLANTIQUE-12',
      duressPasscode: 'TEMPETE-NOIRE',
      activeZone: 'Zone 03 (Bris de glace Véranda) + Zone 04 (PIR Séjour)',
      zoneDescription: {
        fr: 'Double détection confirmée : bris de vitre acoustique puis mouvement intérieur.',
        en: 'Confirmed sequential trip: acoustic glassbreak then interior PIR motion.'
      },
      alarmTriggerTime: '02:44:19',
      specialInstructions: {
        fr: 'Alarme confirmée multi-zones. Appeler le titulaire sur portable pour confirmation d\'absence, puis déclencher immédiatement Police Secours (17) et astreinte gardiennage.',
        en: 'Multi-zone confirmed burglary. Call owner on mobile to confirm absence, then dispatch Police and keyholder patrol immediately.'
      }
    },
    defaultPersonaId: 'per-thomas',
    expectedAction: {
      fr: 'Alerte Police 17 (Effraction avérée)',
      en: 'Confirmed Police Dispatch (Burglary)'
    },
    rules: {
      mustVerifyPasscode: true,
      isDuressScenario: false,
      forbidDisclosure: false,
      canCancel: false
    },
    openingLine: {
      fr: 'Allô ? Oui c\'est Thomas Lefebvre... Je suis à l\'étranger à Rome là ! Personne n\'est censé être dans la maison ! Qu\'est-ce qui se passe ?',
      en: 'Hello? Yes, Thomas Lefebvre here... I am abroad in Rome right now! Nobody is supposed to be in the house! What is going on?'
    }
  },
  {
    id: 'scn-06-elderly-fall',
    code: 'ARC-106',
    category: 'MEDICAL',
    priority: 'P1-CRITICAL',
    title: {
      fr: 'Chute et bouton panique personne âgée',
      en: 'Elderly Medical Fall (SOS Pendant Alarm)'
    },
    summary: {
      fr: 'Déclenchement transmetteur téléassistance. L\'abonnée répond au sol, voix faible, incapable de se relever.',
      en: 'Telecare pendant triggered. Subscriber answers from the floor, weak voice, unable to get up.'
    },
    siteInfo: {
      siteName: 'Logement Tremblay Sophie',
      siteAddress: '8 Rue des Lilas, 59000 Lille',
      accountNumber: 'CHB-FR-302199',
      systemType: 'Chubb Carephone 10 / Téléassistance VivreChezSoi',
      customerName: 'Sophie Tremblay',
      phone: '+33 3 20 55 44 33',
      primaryPasscode: 'MUGUET-09',
      duressPasscode: 'NON_APPLICABLE',
      activeZone: 'Interphone Vocal - Médaillon d\'appel d\'urgence étanche',
      zoneDescription: {
        fr: 'Médaillon porté au cou avec détecteur accélérométrique de chute.',
        en: 'Neck pendant with built-in fall accelerometer.'
      },
      alarmTriggerTime: '08:22:10',
      specialInstructions: {
        fr: 'En cas de détresse médicale avérée ou incapacité à se lever : contacter immédiatement le SAMU (15) et la voisine dépositaire des clés (Mme Girard : 06.88.11.22.33).',
        en: 'On verified medical distress or fall: immediately contact emergency medical services (SAMU/EMS) and designated keyholder neighbor.'
      }
    },
    defaultPersonaId: 'per-sophie',
    expectedAction: {
      fr: 'Appel SAMU 15/112',
      en: 'Dispatch Medical Emergency'
    },
    rules: {
      mustVerifyPasscode: false,
      isDuressScenario: false,
      forbidDisclosure: false,
      canCancel: false
    },
    openingLine: {
      fr: 'Allô... ? Oui... c\'est Sophie... Je... j\'ai glissé dans le couloir en allant chercher mon courrier... Je ne peux plus me relever, j\'ai très mal à la hanche...',
      en: 'Hello...? Yes... it\'s Sophie... I... I slipped in the hallway going to get the mail... I can\'t get back up, my hip hurts so bad...'
    }
  },
  {
    id: 'scn-07-cleaning-staff',
    code: 'ARC-107',
    category: 'INTRUSION',
    priority: 'P2-HIGH',
    title: {
      fr: 'Personnel de ménage sans mot de passe',
      en: 'Night Cleaning Staff with No Passcode'
    },
    summary: {
      fr: 'Intervention d\'entretien à 03h du matin. L\'employée a la clé mais aucun code verbal de sécurité.',
      en: 'Night maintenance at 3 AM. Employee has physical key but no verbal security passcode.'
    },
    siteInfo: {
      siteName: 'Cabinet Juridique Associés',
      siteAddress: '45 Boulevard Malesherbes, 75008 Paris',
      accountNumber: 'CHB-FR-554190',
      systemType: 'Chubb Advisor Advanced',
      customerName: 'Me. Bertrand Delorme (Associé gérant)',
      phone: '+33 1 42 68 90 00',
      primaryPasscode: 'LEX-JUSTITIA',
      duressPasscode: 'SILENCE-AVOCAT',
      activeZone: 'Zone 02 - Détecteur Volumétrique Bureaux 1er Étage',
      zoneDescription: {
        fr: 'PIR couloir principal des bureaux de consultation.',
        en: 'PIR hallway outside private consultation offices.'
      },
      alarmTriggerTime: '03:15:30',
      specialInstructions: {
        fr: 'Seul Me Delorme ou Mme Martin sont habilités à annuler avec LEX-JUSTITIA. Si l\'appelant n\'a pas de mot de passe, NE PAS couper l\'alarme, contacter Me Delorme sur astreinte.',
        en: 'Only verified keyholders with LEX-JUSTITIA can authorize abort. If caller has no code, keep alarm armed and contact managing partner.'
      }
    },
    defaultPersonaId: 'per-elena',
    expectedAction: {
      fr: 'Refus d\'annulation & Envoi Patrouille',
      en: 'Deny Abort & Dispatch Patrol'
    },
    rules: {
      mustVerifyPasscode: true,
      isDuressScenario: false,
      forbidDisclosure: true,
      canCancel: false
    },
    openingLine: {
      fr: 'Allô bonsoir ! S\'il vous plaît, je suis de la société Nettoyage Propreté Express... La porte s\'est mise à biper super fort en entrant, j\'ai mon badge de service !',
      en: 'Hello good evening! Please, I am from Express Cleaners... The door began beeping super loud when I entered, I have my staff cleaning badge!'
    }
  },
  {
    id: 'scn-08-waterflow-sprinkler',
    code: 'ARC-108',
    category: 'FIRE',
    priority: 'P1-CRITICAL',
    title: {
      fr: 'Déclenchement Sprinkler Industriel (Débit d\'eau)',
      en: 'Industrial Sprinkler Waterflow Alarm'
    },
    summary: {
      fr: 'Pressostat de débit d\'eau sprinkler activé dans un centre logistique. Alerte incendie majeure potentielle.',
      en: 'Sprinkler waterflow switch activated in logistics hub. Potential major fire/flooding hazard.'
    },
    siteInfo: {
      siteName: 'Hub Logistique Chubb Cargo',
      siteAddress: 'Z.I. Plaine de l\'Ain, 01150 Saint-Vulbas',
      accountNumber: 'CHB-FR-119283',
      systemType: 'Centrale Incendie Chubb Delta Fire EN54',
      customerName: 'Thomas Lefebvre',
      phone: '+33 4 74 40 12 00',
      primaryPasscode: 'DELTA-CARGO-99',
      duressPasscode: 'ALERTE-ROUGE',
      activeZone: 'Poste Sprinkler 03 - Pressostat Débit d\'Eau Ligne Sud',
      zoneDescription: {
        fr: 'Détection débit d\'eau continue > 30 litres/min sur réseau déluge.',
        en: 'Continuous waterflow detection > 30 L/min on deluge sprinkler network.'
      },
      alarmTriggerTime: '19:40:02',
      specialInstructions: {
        fr: 'Toute alarme débit d\'eau requiert la confirmation immédiate avec le chef de site et déclenchement SDIS (18/112) sans délai si non joignable.',
        en: 'Waterflow switch trip requires immediate fire department (18/112) dispatch unless verified closed by chief engineer with DELTA-CARGO-99.'
      }
    },
    defaultPersonaId: 'per-thomas',
    expectedAction: {
      fr: 'Appel Pompiers 18/112',
      en: 'Dispatch Firefighters (112/911)'
    },
    rules: {
      mustVerifyPasscode: true,
      isDuressScenario: false,
      forbidDisclosure: false,
      canCancel: false
    },
    openingLine: {
      fr: 'Lefebvre au poste de garde ! Oui le panneau déluge du quai 4 est en train de cracher de l\'eau, on a une tête sprinkler arrachée par un chariot élévateur ! Envoyez les pompiers immédiatement !',
      en: 'Lefebvre at guard post! Yes, the deluge riser on dock 4 is discharging water, a forklift sheared off a sprinkler head! Dispatch fire brigade immediately!'
    }
  },
  {
    id: 'scn-09-retail-holdup',
    code: 'ARC-109',
    category: 'HOLDUP',
    priority: 'P1-CRITICAL',
    title: {
      fr: 'Bouton anti-agression caisse magasin (Hold-up)',
      en: 'Silent Cash Register Holdup (Panic Button)'
    },
    summary: {
      fr: 'Pédale silencieuse anti-hold-up déclenchée sous le comptoir d\'un bureau de tabac / commerce de nuit.',
      en: 'Silent under-counter panic foot switch triggered at night convenience store.'
    },
    siteInfo: {
      siteName: 'Tabac Presse Le Fontenoy',
      siteAddress: '15 Place de la République, 35000 Rennes',
      accountNumber: 'CHB-FR-882019',
      systemType: 'Chubb Galaxy Flex 20 Grade 3',
      customerName: 'Lucas Martinez',
      phone: '+33 2 99 78 30 11',
      primaryPasscode: 'BRETAGNE-35',
      duressPasscode: 'ARMOR-SILENCE',
      activeZone: 'Zone 01 - Pédale Silencieuse Anti-Agression Caisse 1',
      zoneDescription: {
        fr: 'Contact double poussoir silencieux anti-sabotage sous le monnayeur.',
        en: 'Silent dual-action anti-tamper hold-up pedal under change drawer.'
      },
      alarmTriggerTime: '22:58:14',
      specialInstructions: {
        fr: 'NE PAS FAIRE SONNER LE TÉLÉPHONE SUR LE SITE. Écoute d\'ambiance discrète puis transmission immédiate au commissariat central (Code 10-33 Agression armée).',
        en: 'DO NOT CALL OPENLY TO CAUSE SUSPICION. Listen discreetly or dispatch police 10-33 for in-progress armed robbery.'
      }
    },
    defaultPersonaId: 'per-lucas',
    expectedAction: {
      fr: 'Alerte Police 17 (Effraction avérée)',
      en: 'Confirmed Police Dispatch (Burglary)'
    },
    rules: {
      mustVerifyPasscode: true,
      isDuressScenario: false,
      forbidDisclosure: true,
      canCancel: false
    },
    openingLine: {
      fr: '... (Voix feutrée et coupée) Allô... oui... j\'ai un problème au comptoir... deux individus masqués...',
      en: '... (Muffled, hurried whisper) Hello... yes... situation at the counter... two masked individuals...'
    }
  },
  {
    id: 'scn-10-pet-pir-trip',
    code: 'ARC-110',
    category: 'INTRUSION',
    priority: 'P3-MEDIUM',
    title: {
      fr: 'Détecteur volumétrique & Nouvel animal domestique',
      en: 'PIR Motion Triggered by New Pet Dog'
    },
    summary: {
      fr: 'Le client a adopté un grand berger allemand qui saute sur les fauteuils et active le radar PIR.',
      en: 'Customer adopted a large dog that jumped on sofa, tripping non-pet-immune PIR detector.'
    },
    siteInfo: {
      siteName: 'Pavillon Les Hortensias',
      siteAddress: '7 Impasse des Fleurs, 44000 Nantes',
      accountNumber: 'CHB-FR-701928',
      systemType: 'Chubb Advisor One',
      customerName: 'Marc Dubois',
      phone: '+33 2 40 12 34 56',
      primaryPasscode: 'ASTERIX-44',
      duressPasscode: 'OBELIX-SOS',
      activeZone: 'Zone 03 - Détecteur PIR Grand Séjour',
      zoneDescription: {
        fr: 'Infrarouge passif grand angle standard (non immunisé animaux > 15kg).',
        en: 'Standard wide-angle passive IR (not immune to pets > 15kg).'
      },
      alarmTriggerTime: '11:14:05',
      specialInstructions: {
        fr: 'Annulation possible uniquement sur fourniture du mot de passe ASTERIX-44. Noter la demande de réglage immunité animaux.',
        en: 'Cancellation allowed only with ASTERIX-44 passcode. Log service request for pet-immune sensor retrofit.'
      }
    },
    defaultPersonaId: 'per-marc',
    expectedAction: {
      fr: 'Annulation justifiée (Code correct)',
      en: 'Verified Abort (Valid Passcode)'
    },
    rules: {
      mustVerifyPasscode: true,
      isDuressScenario: false,
      forbidDisclosure: true,
      canCancel: true
    },
    openingLine: {
      fr: 'Allô le centre d\'alarme ? Oh la la, je suis désolé, c\'est notre nouveau chiot berger qui a sauté sur la table du salon pendant qu\'on était dans le jardin ! Le code c\'est ASTERIX-44 !',
      en: 'Hello monitoring center? Oh goodness, so sorry, our new shepherd dog jumped onto the dining table while we were in the yard! Passcode is ASTERIX-44!'
    }
  },
  {
    id: 'scn-11-pharma-cold-room',
    code: 'ARC-111',
    category: 'TECHNICAL',
    priority: 'P2-HIGH',
    title: {
      fr: 'Alarme technique chambre froide laboratoire (-80°C)',
      en: 'Pharma Ultra-Low Freezer Failure (-80°C)'
    },
    summary: {
      fr: 'Sonde de température laboratoire en dérive thermique. Vaccins et prélèvements à risque.',
      en: 'Laboratory temperature sensor warning. Critical vaccines at risk of thawing.'
    },
    siteInfo: {
      siteName: 'Laboratoire Bio-Recherche Alpha',
      siteAddress: '88 Route de Genève, 69007 Lyon',
      accountNumber: 'CHB-FR-993821',
      systemType: 'Chubb Supervision Technique Modbus',
      customerName: 'Dr. Elena Rostova',
      phone: '+33 4 78 99 00 11',
      primaryPasscode: 'CRYO-PHARMA-7',
      duressPasscode: 'NON_APPLICABLE',
      activeZone: 'Entrée Technique 04 - Sonde PT100 Congélateur N°2 (-62°C)',
      zoneDescription: {
        fr: 'Seuil critique de consigne dépassé : température mesurée -62°C (seuil max -70°C).',
        en: 'Critical threshold breach: measured -62°C (max allowed -70°C).'
      },
      alarmTriggerTime: '01:50:48',
      specialInstructions: {
        fr: 'Alerter l\'astreinte maintenance biomédicale dans les 15 minutes. Mot de passe de levée technique exigé.',
        en: 'Notify biomedical on-call engineering within 15 minutes. Verify technical clearance code.'
      }
    },
    defaultPersonaId: 'per-elena',
    expectedAction: {
      fr: 'Journalisation Technique',
      en: 'Technical Maintenance Log'
    },
    rules: {
      mustVerifyPasscode: true,
      isDuressScenario: false,
      forbidDisclosure: false,
      canCancel: true
    },
    openingLine: {
      fr: 'Allô ? Oui c\'est le docteur Rostova pour le labo Bio-Recherche. J\'ai reçu l\'alerte SMS sur mon téléphone pour le congélateur -80°C !',
      en: 'Hello? Yes, Dr. Rostova for Bio-Recherche lab. I just got the SMS alert on my phone regarding the -80°C bio-freezer!'
    }
  },
  {
    id: 'scn-12-lone-worker-fall',
    code: 'ARC-112',
    category: 'MEDICAL',
    priority: 'P1-CRITICAL',
    title: {
      fr: 'Dispositif PTI / Travailleur Isolé en détresse',
      en: 'Lone Worker Device (DATI Man-Down Alert)'
    },
    summary: {
      fr: 'Agent de sécurité en ronde nocturne ayant fait une chute ou victime d\'un malaise dans une zone isolée.',
      en: 'Night security guard fall or syncope detected in remote warehouse section.'
    },
    siteInfo: {
      siteName: 'Parc d\'Activités Sud Logistique',
      siteAddress: 'Zone Fret Aérogare, 31700 Blagnac',
      accountNumber: 'CHB-FR-662810',
      systemType: 'Chubb Lone Worker DATI GSM/GPS',
      customerName: 'Lucas Martinez (Agent rondier)',
      phone: '+33 6 88 44 22 11',
      primaryPasscode: 'GARDIEN-31',
      duressPasscode: 'DANGER-PATROUILLE',
      activeZone: 'Balise Portative DATI #04 - Alarme Immobilité Prolongée > 60s',
      zoneDescription: {
        fr: 'Capteur de perte de verticalité et immobilité prolongée secteur B2.',
        en: 'Loss of verticality and prolonged stillness sensor in sector B2.'
      },
      alarmTriggerTime: '04:12:33',
      specialInstructions: {
        fr: 'Appel vocal bidirectionnel immédiat sur le boîtier. En l\'absence de réponse claire ou en cas de gémissements : déclencher le chef de poste et les secours (15/18).',
        en: 'Immediate 2-way audio call to unit. If unresponsive or groaning: dispatch supervisor and emergency medical services.'
      }
    },
    defaultPersonaId: 'per-lucas',
    expectedAction: {
      fr: 'Appel SAMU 15/112',
      en: 'Dispatch Medical Emergency'
    },
    rules: {
      mustVerifyPasscode: false,
      isDuressScenario: false,
      forbidDisclosure: false,
      canCancel: false
    },
    openingLine: {
      fr: '... (Bruit de souffle lourd) ... Gémissement ... J\'ai... j\'ai fait une chute dans les escaliers métalliques... je ne sens plus ma jambe...',
      en: '... (Heavy labored breathing) ... Groans ... I... I fell down the exterior steel stairs... I can\'t feel my leg...'
    }
  },
  {
    id: 'scn-13-aggressive-caller',
    code: 'ARC-113',
    category: 'INTRUSION',
    priority: 'P2-HIGH',
    title: {
      fr: 'Client agressif exigeant la coupure sans mot de passe',
      en: 'Abusive Caller Demanding Siren Shutoff Without Code'
    },
    summary: {
      fr: 'L\'appelant refuse d\'écouter, insulte l\'opérateur et exige qu\'on coupe la sirène immédiatement sans donner son mot de passe.',
      en: 'Caller refuses to follow procedure, swears at operator, and demands immediate shutoff without giving passcode.'
    },
    siteInfo: {
      siteName: 'Résidence Bel-Air',
      siteAddress: '19 Rue du Bac, 92100 Boulogne-Billancourt',
      accountNumber: 'CHB-FR-774411',
      systemType: 'Chubb Advisor Advanced CD72',
      customerName: 'Marc Dubois',
      phone: '+33 1 46 20 10 00',
      primaryPasscode: 'NEPTUNE-92',
      duressPasscode: 'URANUS-SOS',
      activeZone: 'Zone 01 - Sabotage Boîtier Sirène Extérieure',
      zoneDescription: {
        fr: 'Contact d\'arrachement sirène extérieure façade nord.',
        en: 'Tamper switch tear-off contact on north exterior siren.'
      },
      alarmTriggerTime: '23:30:12',
      specialInstructions: {
        fr: 'Rester calme et courtois. Rappeler que pour la sécurité des lieux, AUCUNE commande à distance de coupure ne peut être exécutée sans identification formelle et mot de passe valide.',
        en: 'Remain courteous and firm. Reiterate that for site safety, NO remote command can be executed without valid verbal authentication.'
      }
    },
    defaultPersonaId: 'per-marc',
    expectedAction: {
      fr: 'Refus d\'annulation & Envoi Patrouille',
      en: 'Deny Abort & Dispatch Patrol'
    },
    rules: {
      mustVerifyPasscode: true,
      isDuressScenario: false,
      forbidDisclosure: true,
      canCancel: false
    },
    openingLine: {
      fr: 'Écoutez-moi bien ! Votre fichue boîte fait un raffut infernal depuis 5 minutes et tous mes voisins sont sur le balcon ! Vous allez couper cette sirène TOUT DE SUITE ou je vous fais un procès !',
      en: 'Listen to me right now! Your damn box has been making an unbearable noise for 5 minutes and all my neighbors are outside! Shut this siren OFF RIGHT NOW or I am suing your company!'
    }
  },
  {
    id: 'scn-14-panel-tamper',
    code: 'ARC-114',
    category: 'TAMPER',
    priority: 'P1-CRITICAL',
    title: {
      fr: 'Sabotage centrale / Arrachement boîtier mural',
      en: 'Central Panel Tamper / Wall Tear-off Alarm'
    },
    summary: {
      fr: 'La centrale d\'alarme envoie un code d\'autoprotection ouverture boîtier et arrachement mural en pleine nuit.',
      en: 'Control panel transmits wall tamper and cover open tamper signal in dead of night.'
    },
    siteInfo: {
      siteName: 'Bijouterie Diamant Doré',
      siteAddress: '5 Place Vendôme, 75001 Paris',
      accountNumber: 'CHB-FR-990011',
      systemType: 'Chubb ATS Master Grade 4 Haut Risque',
      customerName: 'Claire Vasseur (Gérante)',
      phone: '+33 1 42 60 00 22',
      primaryPasscode: 'OR-PUR-750',
      duressPasscode: 'RUBIS-SANGLANT',
      activeZone: 'Boîtier Central - Autoprotection Arrachement & Brouillage Radio',
      zoneDescription: {
        fr: 'Contact microrupteur fond de coffret + détection brouillage radio ISM 868MHz.',
        en: 'Backplate tear-off microswitch + 868MHz ISM band RF jamming alert.'
      },
      alarmTriggerTime: '03:48:19',
      specialInstructions: {
        fr: 'Site classé Haut Risque Bijouterie. Alarme autoprotection nocturne = suspicion de tentative d\'effraction avec neutralisation électronique. Déclenchement Police secours prioritaire.',
        en: 'High-risk jewelry site. Night panel tamper = suspected electronic sabotage in progress. Dispatch Police priority 1 immediately.'
      }
    },
    defaultPersonaId: 'per-impostor',
    expectedAction: {
      fr: 'Alerte Police 17 (Effraction avérée)',
      en: 'Confirmed Police Dispatch (Burglary)'
    },
    rules: {
      mustVerifyPasscode: true,
      isDuressScenario: false,
      forbidDisclosure: true,
      canCancel: false
    },
    openingLine: {
      fr: 'Allô ? Oui, c\'est le technicien d\'astreinte... On fait une petite maintenance sur le boîtier réseau de la boutique, vous pouvez ignorer les bips...',
      en: 'Hello? Yeah, this is the on-call maintenance technician... We are doing minor network servicing on the shop box, you can disregard the beeps...'
    }
  },
  {
    id: 'scn-15-hvac-unannounced-test',
    code: 'ARC-115',
    category: 'TECHNICAL',
    priority: 'P3-MEDIUM',
    title: {
      fr: 'Maintenance CVC en toiture non signalée',
      en: 'Unannounced Rooftop HVAC Contractor Trip'
    },
    summary: {
      fr: 'Un technicien frigoriste déclenche la trappe de toiture sans avoir prévenu le centre pour mise en essai.',
      en: 'Refrigeration technician opens roof access hatch without requesting prior test-mode bypass.'
    },
    siteInfo: {
      siteName: 'Supermarché Grand Frais Distribution',
      siteAddress: 'Zone Commerciale Nord, 38130 Échirolles',
      accountNumber: 'CHB-FR-441890',
      systemType: 'Chubb Advisor Advanced CD128',
      customerName: 'Thomas Lefebvre (Directeur)',
      phone: '+33 4 76 22 10 00',
      primaryPasscode: 'FRAIS-NORD-38',
      duressPasscode: 'DANGER-GLACE',
      activeZone: 'Zone 11 - Contact Magnétique Blindé Trappe Toiture Technique',
      zoneDescription: {
        fr: 'Contact grande ouverture trappe d\'accès centrale de climatisation.',
        en: 'Heavy-duty magnetic contact on rooftop chiller access hatch.'
      },
      alarmTriggerTime: '07:15:22',
      specialInstructions: {
        fr: 'Aucune intervention technique autorisée sans ordre de mission signé et mot de passe de mise en essai du responsable de magasin.',
        en: 'No technical servicing authorized without signed work order and store manager bypass code.'
      }
    },
    defaultPersonaId: 'per-antoine',
    expectedAction: {
      fr: 'Refus d\'annulation & Envoi Patrouille',
      en: 'Deny Abort & Dispatch Patrol'
    },
    rules: {
      mustVerifyPasscode: true,
      isDuressScenario: false,
      forbidDisclosure: true,
      canCancel: false
    },
    openingLine: {
      fr: 'Ouais allô ! C\'est Mercier de la boîte Climat-Froid. Votre trappe à la c** s\'est mise à gueuler dès que j\'ai ouvert le capot pour vérifier le compresseur ! Dégagez-moi cette alarme !',
      en: 'Yeah hello! Mercier from Clim-Cold Services. Your damn hatch started blaring as soon as I opened the cover to service the compressor! Turn off this alarm!'
    }
  }
];
