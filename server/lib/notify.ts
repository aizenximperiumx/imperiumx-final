type Client = {
  res: any;
};

const userClients = new Map<string, Set<Client>>();

export function addUserClient(userId: string, res: any) {
  let set = userClients.get(userId);
  if (!set) {
    set = new Set<Client>();
    userClients.set(userId, set);
  }
  const client: Client = { res };
  set.add(client);
  res.on('close', () => {
    set?.delete(client);
  });
}

export function broadcastUser(userId: string, event: any) {
  const set = userClients.get(userId);
  if (!set) return;
  const payload = `data: ${JSON.stringify(event)}\n\n`;
  for (const c of set) {
    try {
      c.res.write(payload);
    } catch {}
  }
}

