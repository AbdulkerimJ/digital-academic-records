/**
 * Domain utility for handling subdomain-based routing.
 */

export const isPortalSubdomain = () => {
  const hostname = window.location.hostname;
  
  // Local testing: portal.localhost or portal.nilarvs.local
  if (hostname.startsWith("portal.")) {
    return true;
  }
  
  // Production: portal.nilarvs.gov.et
  // You can add specific production domain checks here if needed
  
  return false;
};

export const getBaseDomain = () => {
  const hostname = window.location.hostname;
  const parts = hostname.split(".");
  
  // If it's a subdomain (e.g., portal.nilarvs.local), return nilarvs.local
  if (parts.length > 2) {
    return parts.slice(1).join(".");
  }
  
  return hostname;
};

export const getPortalUrl = () => {
  const protocol = window.location.protocol;
  const port = window.location.port ? `:${window.location.port}` : "";
  const baseDomain = getBaseDomain();
  
  // If we are already on localhost without a subdomain, handle it specifically for dev
  if (baseDomain === "localhost") {
    return `${protocol}//portal.localhost${port}`;
  }
  
  return `${protocol}//portal.${baseDomain}${port}`;
};

export const getMainUrl = () => {
  const protocol = window.location.protocol;
  const port = window.location.port ? `:${window.location.port}` : "";
  const baseDomain = getBaseDomain();
  
  return `${protocol}//${baseDomain}${port}`;
};
