-- Owner management milestone: support owner-facing inquiry states.

ALTER TABLE public.inquiries
DROP CONSTRAINT IF EXISTS inquiries_status_check;

ALTER TABLE public.inquiries
ADD CONSTRAINT inquiries_status_check
CHECK (
  status = ANY (
    ARRAY[
      'new'::text,
      'approved'::text,
      'contacted'::text,
      'booked'::text,
      'visited'::text,
      'closed'::text,
      'rejected'::text
    ]
  )
);
