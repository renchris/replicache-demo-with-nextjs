type Message = {
  from: string;
  content: string;
  order: number;
}

export type MessageWithID = Message & { id: string }

export type Affected = {
  listIDs: string[];
  userIDs: string[];
}

/**
 * A Client View Record (CVR) is a minimal representation of a Client View snapshot.
 * In other words, it captures what data a Client Group had at a particular moment in time.
 */
type ClientViewRecord = {
  // Value of ReplicacheClientGroup.clientVersion at time of generation.
  clientVersion: number;
  // Map of key->version pairs, one for each entity in the client view.
  entities: Record<string, number>;
}

/**
 * One CVR is generated for each pull response and stored in some ephemeral storage.
 * The storage doesn’t need to be durable —
 * if the CVR is lost, the server can just send a reset patch.
 * And the storage doesn’t need to be transactional with the database. Redis is fine.
 *
 * The CVRs are stored keyed under an incrementing ID which becomes the cookie sent to Replicache.
 *
 * During pull,the server uses the cookie to
 * lookup the CVR associated with the previous pull response.
 * It then computes a new CVR for the latest server state
 * and diffs the two CVRs to compute the delta to send to the client.
 */
export type ClientGroupRecord = {
  id: string;
  userID?;
  clientVersion: number;
  cvrVersion: number | null;
}

export type ClientRecord = {
  id: string;
  clientGroupID: string;
  lastMutationID: number;
  clientVersion: number;
}

// Each of your domain entities will have one extra field.
type Todo = {
// ... fields needed for your application (id, title, complete, etc)
  // Incremented each time this row is updated.
  // Note this is not the same as the global or per-space versioning scheme.
  // Each entity has their *own* version which increments independently.
  version: number;
}
