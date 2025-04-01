INSERT INTO ih.profiles (
  user_id,
  first_name,
  last_name,
  x_link,
  raw_product_links
) VALUES (
  'declan_gessel',
  'Declan',
  'Gessel',
  'https://x.com/_dcai',
  'https://myminutes.ai/,https://myjotbot.com/,https://apps.apple.com/us/app/glass-ai-skincare-acne-scan/id6553964022'
) RETURNING *;