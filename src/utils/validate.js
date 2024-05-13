/**
 * Checks if the input string matches the format of a valid domain.
 * @param {string} str - The string to be checked for domain format.
 * @returns {boolean} True if the input string matches the domain format, false otherwise.
 */
const isDomain = (str) => {
  let regex = /^(?:[-A-Za-z0-9]+\.)+[A-Za-z]{2,6}$/;
  return regex.test(str);
};

/**
 * Checks if the input string matches the format of a valid IPv4 address.
 * @param {string} str - The string to be checked for IPv4 address format.
 * @returns {boolean} True if the input string matches the IPv4 address format, false otherwise.
 */
const isIPv4 = (str) => {
  let regex = /^(\d{1,3}\.){3}\d{1,3}$/;
  return regex.test(str);
};

/**
 * Checks if the input string matches the format of a valid IPv6 address.
 * @param {string} str - The string to be checked for IPv6 address format.
 * @returns {boolean} True if the input string matches the IPv6 address format, false otherwise.
 */
const isIPv6 = (str) => {
  let regex = /^([0-9a-fA-F]{1,4}:){7}[0-9a-fA-F]{1,4}$/;
  return regex.test(str);
};

const isIP = (input) => isIPv4(input) || isIPv6(input);

/**
 * Validates the input string to determine if it represents a domain or an IP address.
 * @param {string} input - The input string to be validated.
 * @returns {Object | undefined} An object with the validated domain or IP address, or undefined if validation fails.
 */
export const validate = (input) => {
  if (isDomain(input)) {
    return { type: "domain", value: input };
  }
  if (isIP(input)) {
    return { type: "ip", value: input };
  }
  try {
    const { hostname } = new URL(input);
    if (isDomain(hostname)) {
      return { type: "domain", value: hostname };
    }
    if (isIP(hostname)) {
      return { type: "ip", value: hostname };
    }
  } catch {
    return {};
  }
};
