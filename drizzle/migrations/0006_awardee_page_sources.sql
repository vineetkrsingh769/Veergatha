-- Replace the Gallantry Awards portal *homepage* source with each recipient's own
-- awardee record page. Each id below was matched by name and award against an
-- archived copy of the page (snapshot timestamp alongside), because the portal
-- itself is often unreachable from outside India. The archived copy is stored
-- with the source so readers can still open the record when the portal is down.
with links (slug, awardee_id, snapshot) as (
  values
    ('jadunath-singh',             1045, '20241202061047'),
    ('somnath-sharma',             1049, '20241203210502'),
    ('karam-singh',                1050, '20241207051104'),
    ('rama-raghoba-rane',          1051, '20241203004711'),
    ('piru-singh',                 1053, '20220925113404'),
    ('gurbachan-singh-salaria',    1054, '20230827194729'),
    ('dhan-singh-thapa',           1055, '20240612180128'),
    ('joginder-singh',             1056, '20240302125917'),
    ('shaitan-singh',              1057, '20230921144914'),
    ('abdul-hamid',                1058, '20241202224740'),
    ('ardeshir-burzorji-tarapore', 1059, '20250201115438'),
    ('arun-khetarpal',             1060, '20241203035730'),
    ('hoshiar-singh',              1061, '20231213113124'),
    ('albert-ekka',                1062, '20241202031338'),
    ('ramaswamy-parameswaran',     1063, '20221125053920'),
    ('bana-singh',                 1064, '20240825061402'),
    ('vikram-batra',               1065, '20241202194522'),
    ('manoj-kumar-pandey',         1066, '20221204220815'),
    ('sanjay-kumar',               1067, '20241204041146'),
    ('yogendra-singh-yadav',       1068, '20240823170241')
)
update public.martyrs m
set sources = (
  select jsonb_agg(
    case
      when s ->> 'url' = 'https://gallantryawards.gov.in/' then jsonb_build_object(
        'field', 'awards',
        'title', 'Awardee record: ' || m.full_name,
        'publisher', 'Gallantry Awards Portal, Ministry of Defence',
        'url', 'https://www.gallantryawards.gov.in/awardee/' || l.awardee_id,
        'archived', 'https://web.archive.org/web/' || l.snapshot || '/https://www.gallantryawards.gov.in/awardee/' || l.awardee_id,
        'tier', 'primary',
        'accessed', '2026-10-25'
      )
      else s
    end
    order by o
  )
  from jsonb_array_elements(m.sources) with ordinality as t (s, o)
)
from links l
where m.slug = l.slug;
