-- Better lead photographs, chosen in the cinematic review (2026-10-25) and approved by the
-- archive owner. All are openly licensed on Wikimedia Commons with the author credited; links
-- use the same 1920px thumbnail form as the existing media rows (thumb() rewrites the width).
--
--   National War Memorial: the Amar Chakra obelisk replaces the photo of the name sign as lead;
--                          the name wall of the Tyag Chakra is added to its photographs.
--   Siachen:               the Shyok War Memorial (Siachen-sector troops) replaces a museum
--                          display of a machine gun as lead.
--   First Kashmir War:     the Zojila War Memorial (Operation Bison, 1948), a landscape photo,
--                          replaces the portrait-format lead.
--   26/11 Mumbai:          its first photo, the Taj Mahal Palace and the Gateway of India.
-- The previous lead photos stay in the archive, still linked to their records.

with new_media (key, title, description, url, width, height, credit, license, license_detail, source_url, memorial_slug, war_slug) as (
  values
    ('nwm-amar-chakra', 'Amar Chakra, National War Memorial',
     'The obelisk of the Amar Chakra (Circle of Immortality), the innermost circle of the National War Memorial in New Delhi.',
     'https://thumb.wikimedia.org/wikipedia/commons/thumb/8/83/National_War_Memorial_India.jpg/1920px-National_War_Memorial_India.jpg',
     1600, 940, 'DiplomatTesterMan', 'CC-BY-SA'::public.media_license, 'CC BY-SA 4.0',
     'https://commons.wikimedia.org/wiki/File:National_War_Memorial_India.jpg', 'national-war-memorial', null),
    ('nwm-tyag-chakra', 'Names on the Tyag Chakra, National War Memorial',
     'Granite tablets of the Tyag Chakra (Circle of Sacrifice). Among the names visible is that of Major Somnath Sharma, PVC.',
     'https://thumb.wikimedia.org/wikipedia/commons/thumb/f/f5/National_War_Memorial_India%2C_Circle_of_Sacrifice%2C_Somnath_Sharma.jpg/1920px-National_War_Memorial_India%2C_Circle_of_Sacrifice%2C_Somnath_Sharma.jpg',
     1600, 1200, 'DiplomatTesterMan', 'CC-BY-SA'::public.media_license, 'CC BY-SA 4.0',
     'https://commons.wikimedia.org/wiki/File:National_War_Memorial_India,_Circle_of_Sacrifice,_Somnath_Sharma.jpg', 'national-war-memorial', null),
    ('siachen-shyok', 'Shyok War Memorial, Ladakh',
     'A memorial in the Shyok River valley that commemorates Indian Army personnel deployed in the Siachen Glacier sector.',
     'https://thumb.wikimedia.org/wikipedia/commons/thumb/8/8a/Shyok_War_Memorial.jpg/1920px-Shyok_War_Memorial.jpg',
     1600, 1200, 'Satalah', 'CC0'::public.media_license, 'CC0 1.0',
     'https://commons.wikimedia.org/wiki/File:Shyok_War_Memorial.jpg', null, 'siachen-operation-meghdoot'),
    ('kashmir-zojila', 'Zojila War Memorial, Gumri',
     'The Zojila War Memorial on the Srinagar to Leh highway, honouring the troops of Operation Bison in 1948.',
     'https://thumb.wikimedia.org/wikipedia/commons/thumb/c/c0/Zojila_War_Memorial_Overall_Shot.jpg/1920px-Zojila_War_Memorial_Overall_Shot.jpg',
     1600, 1067, 'Vishyvishal14', 'CC-BY-SA'::public.media_license, 'CC BY-SA 4.0',
     'https://commons.wikimedia.org/wiki/File:Zojila_War_Memorial_Overall_Shot.jpg', null, 'first-kashmir-war-1947'),
    ('mumbai-taj', 'Taj Mahal Palace and the Gateway of India, Mumbai',
     'The Taj Mahal Palace hotel and Taj Tower beside the Gateway of India, seen from the harbour.',
     'https://thumb.wikimedia.org/wikipedia/commons/thumb/d/df/Panoramic_view_of_Taj_Palace_Hotel_and_Taj_Tower_with_the_iconic_Gateway_of_India_in_the_background.jpg/1920px-Panoramic_view_of_Taj_Palace_Hotel_and_Taj_Tower_with_the_iconic_Gateway_of_India_in_the_background.jpg',
     1600, 900, 'iMahesh', 'CC-BY-SA'::public.media_license, 'CC BY-SA 4.0',
     'https://commons.wikimedia.org/wiki/File:Panoramic_view_of_Taj_Palace_Hotel_and_Taj_Tower_with_the_iconic_Gateway_of_India_in_the_background.jpg', null, 'mumbai-2008-operation-black-tornado')
),
inserted as (
  insert into public.media (kind, title, description, url, width, height, credit, license, license_detail, source_url, memorial_id, war_id, verification)
  select 'photo', n.title, n.description, n.url, n.width, n.height, n.credit, n.license, n.license_detail, n.source_url,
         (select id from public.memorials where slug = n.memorial_slug),
         (select id from public.wars where slug = n.war_slug),
         'verified'
  from new_media n
  returning id, source_url
)
select count(*) from inserted;

update public.memorials set hero_media_id = (select id from public.media where source_url = 'https://commons.wikimedia.org/wiki/File:National_War_Memorial_India.jpg')
where slug = 'national-war-memorial';

update public.wars set hero_media_id = (select id from public.media where source_url = 'https://commons.wikimedia.org/wiki/File:Shyok_War_Memorial.jpg')
where slug = 'siachen-operation-meghdoot';

update public.wars set hero_media_id = (select id from public.media where source_url = 'https://commons.wikimedia.org/wiki/File:Zojila_War_Memorial_Overall_Shot.jpg')
where slug = 'first-kashmir-war-1947';

update public.wars set hero_media_id = (select id from public.media where source_url = 'https://commons.wikimedia.org/wiki/File:Panoramic_view_of_Taj_Palace_Hotel_and_Taj_Tower_with_the_iconic_Gateway_of_India_in_the_background.jpg')
where slug = 'mumbai-2008-operation-black-tornado';
