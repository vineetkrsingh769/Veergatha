-- House style: no em dashes in visitor-facing text. Each replacement below was
-- chosen for its sentence (comma, colon or brackets), not applied blindly.
-- Jaswant Garh also loses an unsourced evaluative clause ("one of the Army's
-- most enduring traditions of remembrance"); the fact before it is kept.

update public.martyrs set biography = replace(biography,
  'to clear the route — on one occasion lying beside',
  'to clear the route, on one occasion lying beside')
where slug = 'rama-raghoba-rane';

update public.martyrs set biography = replace(biography,
  'until almost every man had fallen — of about 120 soldiers',
  'until almost every man had fallen: of about 120 soldiers')
where slug = 'shaitan-singh';

update public.martyrs set biography = replace(biography,
  'to capture Quaid Post — a position on the Saltoro Ridge',
  'to capture Quaid Post, a position on the Saltoro Ridge')
where slug = 'bana-singh';

update public.wars set key_events = replace(key_events::text,
  '1 Sikh lands at Srinagar airfield — now marked as Infantry Day.',
  '1 Sikh lands at Srinagar airfield; the anniversary is now marked as Infantry Day.')::jsonb
where slug = 'first-kashmir-war-1947';

update public.wars set description = replace(description,
  'fought a series of stubborn defensive actions — at Namka Chu',
  'fought a series of stubborn defensive actions: at Namka Chu')
where slug = 'sino-indian-war-1962';

update public.wars set
  name = replace(name, 'Siachen Glacier — Operation Meghdoot', 'Siachen Glacier (Operation Meghdoot)'),
  summary = replace(summary, 'above the Siachen Glacier — the highest battlefield', 'above the Siachen Glacier, the highest battlefield')
where slug = 'siachen-operation-meghdoot';

update public.wars set name = replace(name,
  'Indian Peace Keeping Force — Operation Pawan',
  'Indian Peace Keeping Force (Operation Pawan)')
where slug = 'ipkf-operation-pawan';

update public.wars set name = replace(name,
  '26/11 Mumbai — Operation Black Tornado',
  '26/11 Mumbai (Operation Black Tornado)')
where slug = 'mumbai-2008-operation-black-tornado';

update public.wars set description = replace(description,
  'peacetime gallantry awards — the Ashoka, Kirti and Shaurya Chakras — have been earned',
  'peacetime gallantry awards (the Ashoka, Kirti and Shaurya Chakras) have been earned')
where slug = 'jammu-kashmir-counter-insurgency';

update public.memorials set description = replace(description,
  'four concentric circles — Amar Chakra, Veerta Chakra, Tyag Chakra and Rakshak Chakra — carry',
  'four concentric circles (Amar Chakra, Veerta Chakra, Tyag Chakra and Rakshak Chakra) carry')
where slug = 'national-war-memorial';

update public.memorials set significance = replace(significance,
  'as though he were still serving — one of the Army''s most enduring traditions of remembrance.',
  'as though he were still serving.')
where slug = 'jaswant-garh-war-memorial';
