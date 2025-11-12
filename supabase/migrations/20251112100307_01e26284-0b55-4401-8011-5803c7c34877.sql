-- Add whop_plan_id to products table to store Whop checkout plan IDs
ALTER TABLE products ADD COLUMN whop_plan_id text;