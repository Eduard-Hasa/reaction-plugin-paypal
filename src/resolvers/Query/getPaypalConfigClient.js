
/**
 *
 * @method getPaypalConfigClient
 */
export default async function getPaypalConfigClient(_, __, context) {
  return context.queries.getPaypalConfigClient(context);
}
