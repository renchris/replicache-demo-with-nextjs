export type Affected = {
  listIDs: string[];
  userIDs: string[];
}

export type Cookie = {
  order: number;
  clientGroupID: string;
}

export type SearchResult = {
  id: string;
  rowVersion: number;
}

type ClientViewData = Map<string, number>

/**
 * A Client View Record (CVR) is a minimal representation of a Client View snapshot.
 * In other words, it captures what data a Client Group had at a particular moment in time.
 */
export type ClientViewRecord = {
  list: ClientViewData;
  todo: ClientViewData;
  share: ClientViewData;
  clientVersion: number;
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
  clientGroupVersion: number;
  cvrVersion: number | null;
}

export type ClientRecord = {
  id: string;
  clientGroupID: string;
  lastMutationID: number;
  clientVersion: number;
}

export type Todo = {
  id: string;
  listID: string;
  text: string;
  complete: boolean;
  sort: number;
}

export type TodoUpdate = { id: string } & Partial<Todo>

export type Share = {
  id: string;
  listID: string;
  userID: string;
}

export type List = {
  id: string,
  name: string,
  ownerID: string,
}
