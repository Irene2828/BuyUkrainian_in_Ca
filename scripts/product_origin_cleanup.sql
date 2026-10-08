-- Part 2d: Product Origin Cleanup
-- DO NOT RUN THIS AUTOMATICALLY. FOR MANUAL EXECUTION IN SUPABASE ONLY.

-- Kozak Ukrainian Bakery
-- Reason: Sells Canadian-made Ukrainian food (Borsch, Varenyky, Sourdough Bread).
UPDATE locations SET status = 'rejected' WHERE name = 'Kozak Ukrainian Bakery';

-- Future Bakery
-- Reason: Canadian-made bakery (Rye Bread, Poppy Seed Roll).
UPDATE locations SET status = 'rejected' WHERE name = 'Future Bakery';

-- Shumka Ukrainian Foods
-- Reason: Canadian-made food (Perogies, Cabbage Rolls).
UPDATE locations SET status = 'rejected' WHERE name = 'Shumka Ukrainian Foods';

-- Saskatoon Co-op
-- Reason: Canadian-made food / local cooperative.
UPDATE locations SET status = 'rejected' WHERE name = 'Saskatoon Co-op';

-- Note: Yummy Market (sells imported Roshen, Kvas, Buckwheat) is KEPT.
-- Note: Ukrainian Gift Shop (sells Embroidery, Pottery) is kept pending owner confirmation.
