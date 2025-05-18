-- Function to check if column exists
DO $$ 
BEGIN
    -- Check if the 'storageType' column exists
    IF NOT EXISTS (
        SELECT 1 
        FROM information_schema.columns 
        WHERE table_name = 'Media' 
        AND column_name = 'storageType'
    ) THEN
        -- Add storageType column to Media table if it doesn't exist
        ALTER TABLE "Media" ADD COLUMN "storageType" TEXT DEFAULT 'local';
        
        -- Update existing records to use default storage type
        UPDATE "Media" SET "storageType" = 'local' WHERE "storageType" IS NULL;
        
        RAISE NOTICE 'Column storageType added successfully';
    ELSE
        RAISE NOTICE 'Column storageType already exists';
    END IF;
END $$; 