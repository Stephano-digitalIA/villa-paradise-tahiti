-- 020_payment_schedule.sql
-- Three-instalment payment plans.
--
-- A reservation already carried `deposit_amount` and `balance_amount`, which
-- describes exactly two payments and no calendar. A plan needs a row per due
-- date, so the reminder job knows what to ask for and when, and so the admin
-- can see what has landed and what has not.
--
-- Nobody lends anything: the guest pays the villa in stages. The amounts stay
-- in USD like every other money column; the currency actually charged is
-- recorded on the reservation.
--
-- Apply manually via the Supabase SQL editor: select everything, run once.
-- Safe to run again.

CREATE TABLE IF NOT EXISTS payment_schedule (
  id             uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  reservation_id uuid NOT NULL REFERENCES reservations(id) ON DELETE CASCADE,
  -- 1, 2 or 3. Ordering and identity in one column.
  sequence       smallint NOT NULL CHECK (sequence BETWEEN 1 AND 3),
  label          text NOT NULL,
  amount         numeric(10,2) NOT NULL CHECK (amount > 0),
  due_date       date NOT NULL,
  status         text NOT NULL DEFAULT 'pending'
                   CHECK (status IN ('pending', 'paid', 'cancelled')),
  paid_at        timestamptz,
  -- Random and unguessable: it is what authenticates the payment link sent by
  -- email, without asking the guest to create an account to pay.
  pay_token      text NOT NULL UNIQUE,
  -- Set when the reminder goes out, so the daily job never mails twice.
  reminded_at    timestamptz,
  created_at     timestamptz NOT NULL DEFAULT now(),
  -- One row per instalment number per reservation. Makes a double insert on a
  -- retried checkout impossible rather than merely unlikely.
  UNIQUE (reservation_id, sequence)
);

CREATE INDEX IF NOT EXISTS payment_schedule_reservation_idx
  ON payment_schedule (reservation_id, sequence);

-- The reminder job asks the same question every morning: what is due soon and
-- still unpaid.
CREATE INDEX IF NOT EXISTS payment_schedule_due_idx
  ON payment_schedule (status, due_date);

-- RLS on, no public policy. The payment page reads a single row by its token
-- server-side with the service role; the anon key can see nothing.
ALTER TABLE payment_schedule ENABLE ROW LEVEL SECURITY;
