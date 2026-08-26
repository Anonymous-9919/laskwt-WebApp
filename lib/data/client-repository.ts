import type { SupabaseClient } from "@supabase/supabase-js";
import type { Repository } from "./types";
import { getMockRepository } from "./mock";
import { hasSupabaseEnv } from "./env";

let repositoryPromise: Promise<Repository> | null = null;

function cacheCommonLists(repository: Repository): Repository {
  let customersPromise: Promise<Awaited<ReturnType<Repository["listCustomers"]>>> | null = null;
  let ordersPromise: Promise<Awaited<ReturnType<Repository["listOrders"]>>> | null = null;

  const getCustomers = () => {
    customersPromise ??= repository.listCustomers().catch((error) => {
      customersPromise = null;
      throw error;
    });
    return customersPromise;
  };

  const getOrders = () => {
    ordersPromise ??= repository.listOrders().catch((error) => {
      ordersPromise = null;
      throw error;
    });
    return ordersPromise;
  };

  const clearCustomers = () => { customersPromise = null; };
  const clearOrders = () => { ordersPromise = null; };

  return {
    ...repository,
    listCustomers: (search) => search?.trim() ? repository.listCustomers(search) : getCustomers(),
    listOrders: getOrders,
    async createCustomer(input, userId) {
      const customer = await repository.createCustomer(input, userId);
      clearCustomers();
      return customer;
    },
    async updateCustomer(id, input) {
      const customer = await repository.updateCustomer(id, input);
      clearCustomers();
      return customer;
    },
    async createOrder(input, userId) {
      const order = await repository.createOrder(input, userId);
      clearOrders();
      return order;
    },
    async updateOrder(id, input) {
      const order = await repository.updateOrder(id, input);
      clearOrders();
      return order;
    },
    async setShopifySync(id, result) {
      const order = await repository.setShopifySync(id, result);
      clearOrders();
      return order;
    },
  };
}

async function getBrowserSupabase(): Promise<SupabaseClient> {
  const { createClient } = await import("@/lib/supabase/client");
  return createClient() as unknown as SupabaseClient;
}

export async function getClientRepository(): Promise<Repository> {
  repositoryPromise ??= (async () => {
    if (!hasSupabaseEnv()) {
      return cacheCommonLists(getMockRepository());
    }
    const { createSupabaseRepository } = await import("./supabase-repo");
    const supabase = await getBrowserSupabase();
    return cacheCommonLists(createSupabaseRepository(supabase));
  })();
  return repositoryPromise;
}
