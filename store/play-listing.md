# Posta hut · Google Play listing

Everything to paste into the Play Console, in the order the Console asks for it.
Images are in this folder.

## Main store listing

**App name** (max 30): `Posta hut: HEMA Guards`

**Short description** (max 80):
`Name the sword guards of Liechtenauer, Fiore, Meyer and more. A HEMA quiz game.`

**Full description** (max 4000):

```
Can you tell Vom Tag from Posta di Donna at a glance?

Posta hut is a quick-fire quiz on the guards of historical European martial arts (HEMA). A fencer drops into a guard; you name it before the ink runs out.

THE MASTERS
• German longsword: Liechtenauer's tradition, as drawn by Joachim Meyer (1570)
• Italian longsword: Fiore dei Liberi's poste (c. 1404)
• Sword and buckler: Royal Armouries Ms. I.33 (c. 1300)
• Rapier: Salvator Fabris (1606)
• Sabre: Alfred Hutton's guards and parries (1889)
• Smallsword: La Touche (1670)

PLAY
• Bout: ten guards, scored on speed and accuracy
• Survival: keep going until you miss three
• Three tiers, from Novice to Master, or play with no timer
• Show the guard as a drawn fencer, or as the original manuscript plate
• Every guard you miss goes into your review deck

THE SALLE
Study every guard: the original plates, variants from both sides, other names it goes by, and where it comes from.

THE ARMOURY
Spend the XP you earn on your own fencer: longswords, rapiers, sabres and weapons from around the world, daggers and bucklers, garb from Fiore's jacket to a Landsknecht doublet, plate harnesses, helms and hats, and the guard your fencer stands in.

THE HALL OF MASTERS
Climb the online Hall by total XP (Celerity) or your best run of correct answers (Fortitude), and see every player's fencer.

No ads. No microtransactions. Everything is earned by playing.
```

**App icon**: `icon-512.png`
**Feature graphic**: `feature-graphic.png`
**Phone screenshots** (in this order): `screenshot-1-title.png` … `screenshot-6-armoury.png`

**App category**: Game → Trivia
**Tags** (pick up to 5 offered): Trivia, Quiz, Educational, History
**Contact email**: required by Google and shown on the listing. Use one you're happy to have public.
**Website** (optional): https://crashingtingler.github.io/posta-hut/
**Privacy policy**: https://crashingtingler.github.io/posta-hut/privacy.html

## App content (Policy → App content)

**Privacy policy**: https://crashingtingler.github.io/posta-hut/privacy.html

**Ads**: No, the app does not contain ads.

**App access**: All functionality is available without special access (no login).

**Content rating** (IARC questionnaire). Answers that matter:
- Category: Game (Trivia/quiz).
- Violence: fencers are shown holding swords in guard positions; no fighting, no blood, no injury. If asked about weapons, answer that weapons are depicted but not used to harm anyone.
- Users interact / share content: **Yes**. Players' chosen display names and fencers are shown publicly in the online Hall. (Names are filtered and can be reported.)
- Shares location: No. Digital purchases: No.
- Expected result: Everyone / PEGI 3–7.

**Target audience**: 13 and over. (Including under-13s brings in Google's Families policy, which has extra rules.)

**News app**: No. **Government app**: No. **Financial features**: None. **Health**: No.

## Data safety form

**Does your app collect or share any of the required user data types?** Yes.
**Is all of the user data collected by your app encrypted in transit?** Yes (HTTPS).
**Do you provide a way for users to request that their data is deleted?** Yes.
- Deletion URL: https://crashingtingler.github.io/posta-hut/delete.html

**Data shared with third parties:** None. (Supabase and Formspree process data for us as service providers; Google does not count that as sharing.)

**Data collected:**

| Data type (Google's name) | What it is | Required or optional | Purposes |
|---|---|---|---|
| Personal info → Name | The display name shown in the Hall | Optional (players can leave the online Hall in Settings) | App functionality |
| Personal info → Email address | Only if added to an error report | Optional | Developer communications |
| App activity → Other actions | XP, best streak and fencer look, for the Hall | Optional | App functionality |
| App activity → Other user-generated content | Text of error reports | Optional | Developer communications, App functionality |
| App info and performance → Diagnostics | Browser/device details sent with an error report | Optional | App functionality |
| Device or other IDs | The random player ID for the online Hall | Optional | App functionality |

Collected data is **not** processed ephemerally; it is kept until deleted.

**Account creation**: the app creates an anonymous player ID, with no username, password or email. If the form asks whether users can create an account, answer **Yes** and give the deletion URL above. That's the safe choice with Google.

## Release

1. Build: `bash tools/build-app.sh aab` → `Downloads/posta-hut-release.aab`.
2. Upload it to a release (Internal testing first, then Closed testing).
3. Let Google manage the app signing key (Play App Signing). The upload key lives in `Documents/posta-hut-keys` and must be backed up.
4. Each new upload needs a higher `versionCode` in `app/android/app/build.gradle`.

New personal developer accounts must run a **closed test with at least 12 testers for 14 days** before Google allows a production release.
