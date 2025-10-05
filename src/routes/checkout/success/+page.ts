export const load = ({ url }: { url: URL }) => {
  const sessionId = url.searchParams.get('session_id');
  
  return {
    sessionId,
    isStripeCheckout: !!sessionId
  };
};
