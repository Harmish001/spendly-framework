-- Create password categories table
CREATE TABLE public.password_categories (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  name TEXT NOT NULL,
  color TEXT DEFAULT '#6366f1',
  icon TEXT DEFAULT 'Folder',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create passwords table
CREATE TABLE public.passwords (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  category_id UUID REFERENCES public.password_categories(id) ON DELETE SET NULL,
  title TEXT NOT NULL,
  username TEXT,
  email TEXT,
  password_encrypted TEXT NOT NULL,
  website_url TEXT,
  notes TEXT,
  is_favorite BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.password_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.passwords ENABLE ROW LEVEL SECURITY;

-- RLS policies for password_categories
CREATE POLICY "Users can view their own categories" 
ON public.password_categories 
FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own categories" 
ON public.password_categories 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own categories" 
ON public.password_categories 
FOR UPDATE 
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own categories" 
ON public.password_categories 
FOR DELETE 
USING (auth.uid() = user_id);

-- RLS policies for passwords
CREATE POLICY "Users can view their own passwords" 
ON public.passwords 
FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own passwords" 
ON public.passwords 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own passwords" 
ON public.passwords 
FOR UPDATE 
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own passwords" 
ON public.passwords 
FOR DELETE 
USING (auth.uid() = user_id);

-- Create function to update timestamps
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create triggers for automatic timestamp updates
CREATE TRIGGER update_password_categories_updated_at
BEFORE UPDATE ON public.password_categories
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_passwords_updated_at
BEFORE UPDATE ON public.passwords
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Insert some default categories
INSERT INTO public.password_categories (user_id, name, color, icon) VALUES
('00000000-0000-0000-0000-000000000000', 'Personal', '#10b981', 'User'),
('00000000-0000-0000-0000-000000000000', 'Work', '#3b82f6', 'Briefcase'),
('00000000-0000-0000-0000-000000000000', 'Banking', '#f59e0b', 'CreditCard'),
('00000000-0000-0000-0000-000000000000', 'Social', '#8b5cf6', 'Users'),
('00000000-0000-0000-0000-000000000000', 'Shopping', '#ef4444', 'ShoppingCart');