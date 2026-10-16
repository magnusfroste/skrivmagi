CREATE OR REPLACE FUNCTION public.upvote_saga(p_saga_id uuid, p_voter_identifier text)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
BEGIN
  IF p_voter_identifier IS NULL OR length(p_voter_identifier) = 0 OR length(p_voter_identifier) > 200 THEN
    RETURN false;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM sagor WHERE id = p_saga_id AND is_public = true) THEN
    RETURN false;
  END IF;
  PERFORM pg_advisory_xact_lock(hashtext(p_saga_id::text || ':' || p_voter_identifier));
  IF EXISTS (SELECT 1 FROM saga_upvotes WHERE saga_id = p_saga_id AND voter_identifier = p_voter_identifier) THEN
    RETURN false;
  END IF;
  INSERT INTO saga_upvotes (saga_id, voter_identifier) VALUES (p_saga_id, p_voter_identifier);
  UPDATE sagor SET upvotes = COALESCE(upvotes, 0) + 1 WHERE id = p_saga_id;
  RETURN true;
END;
$$;

REVOKE ALL ON FUNCTION public.upvote_saga(uuid, text) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.upvote_saga(uuid, text) TO anon, authenticated;