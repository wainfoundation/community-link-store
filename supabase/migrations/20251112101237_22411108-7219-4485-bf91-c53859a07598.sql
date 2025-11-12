-- Create seller_balances table to track earnings
CREATE TABLE seller_balances (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  available_balance numeric NOT NULL DEFAULT 0,
  pending_balance numeric NOT NULL DEFAULT 0,
  total_earned numeric NOT NULL DEFAULT 0,
  updated_at timestamp with time zone DEFAULT now(),
  UNIQUE(user_id)
);

-- Enable RLS
ALTER TABLE seller_balances ENABLE ROW LEVEL SECURITY;

-- Sellers can view their own balance
CREATE POLICY "Users can view own balance"
ON seller_balances
FOR SELECT
USING (auth.uid() = user_id);

-- Add payment tracking columns to orders
ALTER TABLE orders ADD COLUMN whop_payment_id text;
ALTER TABLE orders ADD COLUMN seller_id uuid REFERENCES auth.users(id);
ALTER TABLE orders ADD COLUMN seller_amount numeric;
ALTER TABLE orders ADD COLUMN platform_fee numeric;

-- Create index for faster lookups
CREATE INDEX idx_orders_whop_payment_id ON orders(whop_payment_id);
CREATE INDEX idx_seller_balances_user_id ON seller_balances(user_id);

-- Function to update seller balance
CREATE OR REPLACE FUNCTION update_seller_balance()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Insert or update seller balance
  INSERT INTO seller_balances (user_id, available_balance, total_earned)
  VALUES (NEW.seller_id, NEW.seller_amount, NEW.seller_amount)
  ON CONFLICT (user_id)
  DO UPDATE SET
    available_balance = seller_balances.available_balance + NEW.seller_amount,
    total_earned = seller_balances.total_earned + NEW.seller_amount,
    updated_at = now();
  
  RETURN NEW;
END;
$$;

-- Trigger to update balance when order is created
CREATE TRIGGER on_order_payment_success
AFTER INSERT ON orders
FOR EACH ROW
WHEN (NEW.seller_id IS NOT NULL AND NEW.seller_amount IS NOT NULL)
EXECUTE FUNCTION update_seller_balance();