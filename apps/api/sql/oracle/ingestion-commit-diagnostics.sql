-- Read-only diagnostics for an ingestion COMMIT that does not finish.
-- Run as ADMIN in Database Actions / SQL Worksheet (Run Script, F5).
-- Nothing here changes data, sessions or indexes.

-- 1. App sessions: what each is waiting on and who blocks it.
SELECT sid, serial#, status, machine, event, state, seconds_in_wait,
       blocking_session, final_blocking_session, sql_id, prev_sql_id,
       logon_time
FROM v$session
WHERE username = 'TRACKMYOPT_JOB_APP'
ORDER BY logon_time;

-- 2. Open transactions and remaining undo. A KILLED session that is still
--    rolling back shows a falling USED_UREC on repeated runs.
SELECT s.sid, s.serial#, s.status, t.start_time, t.used_urec, t.used_ublk
FROM v$transaction t
JOIN v$session s ON s.taddr = t.addr
ORDER BY t.start_time;

-- 3. Rollback still in progress for dead or killed transactions.
SELECT usn, state, undoblockstotal, undoblocksdone, cputime
FROM v$fast_start_transactions;

-- 4. Locks held or requested on JOBS, the search table and Oracle Text
--    internal tables (DR$...).
SELECT l.sid, l.type, l.lmode, l.request, l.block, o.owner, o.object_name
FROM v$lock l
LEFT JOIN dba_objects o ON o.object_id = l.id1
WHERE l.sid IN (SELECT sid FROM v$session
                WHERE username IN ('TRACKMYOPT_JOB_APP', 'ADMIN', 'CTXSYS'))
  AND (o.object_name IS NULL OR o.object_name IN ('JOBS', 'TRACKMYOPT_JOB_SEARCH')
       OR o.object_name LIKE 'DR$%')
ORDER BY l.block DESC, l.sid;

-- 5. Oracle Text index sync mode and backlog.
SELECT idx_owner, idx_name, idx_status, idx_sync_type, idx_sync_interval
FROM ctxsys.ctx_indexes
WHERE idx_table = 'TRACKMYOPT_JOB_SEARCH';

SELECT pnd_index_owner, pnd_index_name, COUNT(*) AS pending_rows,
       MIN(pnd_timestamp) AS oldest_pending
FROM ctxsys.ctx_pending
GROUP BY pnd_index_owner, pnd_index_name;

-- 6. Recent Oracle Text sync errors.
SELECT err_index_owner, err_index_name, err_timestamp, err_text
FROM ctxsys.ctx_index_errors
WHERE err_timestamp > SYSDATE - 2
ORDER BY err_timestamp DESC
FETCH FIRST 20 ROWS ONLY;

-- 7. Fragmentation of the Text index ($I token rows per distinct token).
SELECT COUNT(*) AS token_rows, COUNT(DISTINCT token_text) AS tokens
FROM admin.dr$trackmyopt_job_search_idx$i;
-- If the index name differs, use the IDX_NAME from step 5:
-- dr$<idx_name>$i.
