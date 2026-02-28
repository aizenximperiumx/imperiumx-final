type Client = {
  res: any;
};

const ticketClients = new Map<string, Set<Client>>();

export function addTicketClient(ticketId: string, res: any) {
  let set = ticketClients.get(ticketId);
  if (!set) {
    set = new Set<Client>();
    ticketClients.set(ticketId, set);
  }
  const client: Client = { res };
  set.add(client);
  res.on('close', () => {
    set?.delete(client);
  });
}

export function broadcastTicket(ticketId: string, event: any) {
  const set = ticketClients.get(ticketId);
  if (!set) return;
  const payload = `data: ${JSON.stringify(event)}\n\n`;
  for (const c of set) {
    try {
      c.res.write(payload);
    } catch {}
  }
}

