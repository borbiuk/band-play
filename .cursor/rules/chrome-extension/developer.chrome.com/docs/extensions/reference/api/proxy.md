## Description

Use the `chrome.proxy` API to manage Chrome's proxy settings. This API relies on the [ChromeSetting prototype of the type API](https://developer.chrome.com/docs/extensions/reference/api/types#type-ChromeSetting) for getting and setting the proxy configuration.

## Permissions

`proxy`

You must declare the "proxy" permission in the [extension manifest](/docs/extensions/mv3/manifest) to use the proxy settings
API. For example:

```
{
  "name": "My extension",
  ...
  "permissions": [
    "proxy"
  ],
  ...
}

```

## Concepts and usage

Proxy settings are defined in a `[proxy.ProxyConfig](#type-ProxyConfig) object. Depending on Chrome's proxy settings,
the settings may contain `[proxy.ProxyRules](#type-ProxyRules) or a ``[proxy.PacScript](#type-PacScript).

### Proxy modes

A ProxyConfig object's `mode` attribute determines the overall behavior of Chrome with regards to
proxy usage. It can take the following values:`direct`In `direct` mode all connections are created directly, without any proxy involved. This mode allows
no further parameters in the `ProxyConfig` object.`auto_detect`In `auto_detect` mode the proxy configuration is determined by a PAC script that can be downloaded
at [http://wpad/wpad.dat](http://wpad/wpad.dat). This mode allows no further parameters in the `ProxyConfig` object.`pac_script`In `pac_script` mode the proxy configuration is determined by a PAC script that is either retrieved
from the URL specified in the ``[proxy.PacScript](#type-PacScript) object or taken literally from the `data` element
specified in the ``[proxy.PacScript](#type-PacScript) object. Besides this, this mode allows no further parameters
in the `ProxyConfig` object.`fixed_servers`In `fixed_servers` mode the proxy configuration is codified in a ``[proxy.ProxyRules](#type-ProxyRules) object. Its
structure is described in [Proxy rules](#proxy_rules). Besides this, the `fixed_servers`mode allows no further
parameters in the`ProxyConfig` object.`system`In `system`mode the proxy configuration is taken from the operating system. This mode allows no
further parameters in the`ProxyConfig`object. Note that the`system` mode is different from
setting no proxy configuration. In the latter case, Chrome falls back to the system settings only if
no command-line options influence the proxy configuration.

### Proxy rules

The ``[proxy.ProxyRules](#type-ProxyRules) object can contain either a `singleProxy`attribute or a subset of`proxyForHttp`, `proxyForHttps`, `proxyForFtp`, and `fallbackProxy`.
In the first case, HTTP, HTTPS and FTP traffic is proxied through the specified proxy server. Other
traffic is sent directly. In the latter case the behavior is slightly more subtle: If a proxy server
is configured for the HTTP, HTTPS or FTP protocol, the respective traffic is proxied through the
specified server. If no such proxy server is specified or traffic uses a different protocol than
HTTP, HTTPS or FTP, the `fallbackProxy`is used. If no`fallbackProxy` is specified, traffic is sent
directly without a proxy server.

### Proxy server objects

A proxy server is configured in a ``[proxy.ProxyServer](#type-ProxyServer) object. The connection to the proxy server
(defined by the `host` attribute) uses the protocol defined in the `scheme` attribute. If no
`scheme` is specified, the proxy connection defaults to `http`.
If no `port` is defined in a ``[proxy.ProxyServer](#type-ProxyServer) object, the port is derived from the scheme.
The default ports are:SchemePorthttp80https443socks41080socks51080

### Bypass list

Individual servers may be excluded from being proxied with the `bypassList`. This list may contain
the following entries:`[SCHEME://]HOST_PATTERN[:PORT]`
Match all hostnames that match the pattern `HOST_PATTERN`. A leading `"."` is interpreted as a
`"*."`.
Examples: `"foobar.com", "*foobar.com", "*.foobar.com", "*foobar.com:99", "https://x.*.y.com:99"`.PatternMatchesDoes not match`".foobar.com"``"www.foobar.com"``"foobar.com"``"*.foobar.com"``"www.foobar.com"``"foobar.com"``"foobar.com"``"foobar.com"``"www.foobar.com"``"*foobar.com"``"foobar.com"`, `"www.foobar.com"`, `"foofoobar.com"``[SCHEME://]IP_LITERAL[:PORT]`
Match URLs that are IP address literals. Conceptually this is the similar to the first case, but
with special cases to handle IP literal canonicalization. For example, matching on "[0:0:0::1]"
is the same as matching on "[::1]" because the IPv6 canonicalization is done internally.
Examples: `127.0.1`, `[0:0::1]`, `[::1]:80`, `https://[::1]:443``IP_LITERAL/PREFIX_LENGTH_IN_BITS`
Match any URL containing an IP literal (`IP_LITERAL`) within the given
range. The IP range (`PREFIX_LENGTH_IN_BITS`) is specified using [CIDR
notation](https://en.wikipedia.org/wiki/Classless_Inter-Domain_Routing#CIDR_notation).
Match any URL containing an IP literal within the given range. The IP range is specified using CIDR
notation.
Examples: `"192.168.1.1/16", "fefe:13::abc/33"``<local>`
The literal string `<local>` matches simple hostnames. A simple hostname is one that contains no
dots and is not an IP literal. For instance `example` and `localhost` are simple hostnames,
whereas `example.com`, `example.`, and `[::1]` are not.
Example: `"<local>"`

## Examples

The following code sets a SOCKS 5 proxy for HTTP connections to all servers but foobar.com and uses
direct connections for all other protocols. The settings apply to regular and incognito windows, as
incognito windows inherit settings from regular windows. See also the [Types API](/docs/extensions/reference/api/types#type-ChromeSetting)
documentation.

```
var config = {
  mode: "fixed_servers",
  rules: {
    proxyForHttp: {
      scheme: "socks5",
      host: "1.2.3.4"
    },
    bypassList: ["foobar.com"]
  }
};
chrome.proxy.settings.set(
  {value: config, scope: 'regular'},
  function() {}
);

```

The following code sets a custom PAC script.

```
var config = {
  mode: "pac_script",
  pacScript: {
    data: "function FindProxyForURL(url, host) {\n" +
          "  if (host == 'foobar.com')\n" +
          "    return 'PROXY blackhole:80';\n" +
          "  return 'DIRECT';\n" +
          "}"
  }
};
chrome.proxy.settings.set(
  {value: config, scope: 'regular'},
  function() {}
);

```

The next snippet queries the current effective proxy settings. The effective proxy settings can be
determined by another extension or by a policy. See the [Types API](/docs/extensions/reference/api/types#type-ChromeSetting) documentation for details.

```
chrome.proxy.settings.get(
  {'incognito': false},
  function(config) {
    console.log(JSON.stringify(config));
  }
);

```

Note that the `value` object passed to `set()` is not identical to the `value` object passed to
callback function of `get()`. The latter will contain a `rules.proxyForHttp.port` element.

## Types

### Mode

Chrome 54+

#### Enum

"direct"

"auto_detect"

"pac_script"

"fixed_servers"

"system"

### PacScript

An object holding proxy auto-config information. Exactly one of the fields should be non-empty.

#### Properties

- data
  string optional
  A PAC script.
- mandatory
  boolean optional
  If true, an invalid PAC script will prevent the network stack from falling back to direct connections. Defaults to false.
- url
  string optional
  URL of the PAC file to be used.

### ProxyConfig

An object encapsulating a complete proxy configuration.

#### Properties

- mode
  [Mode](#type-Mode)
  'direct' = Never use a proxy
  'auto_detect' = Auto detect proxy settings
  'pac_script' = Use specified PAC script
  'fixed_servers' = Manually specify proxy servers
  'system' = Use system proxy settings
- pacScript
  [PacScript](#type-PacScript)optional
  The proxy auto-config (PAC) script for this configuration. Use this for 'pac_script' mode.
- rules
  [ProxyRules](#type-ProxyRules)optional
  The proxy rules describing this configuration. Use this for 'fixed_servers' mode.

### ProxyRules

An object encapsulating the set of proxy rules for all protocols. Use either 'singleProxy' or (a subset of) 'proxyForHttp', 'proxyForHttps', 'proxyForFtp' and 'fallbackProxy'.

#### Properties

- bypassList
  string[] optional
  List of servers to connect to without a proxy server.
- fallbackProxy
  [ProxyServer](#type-ProxyServer)optional
  The proxy server to be used for everthing else or if any of the specific proxyFor... is not specified.
- proxyForFtp
  [ProxyServer](#type-ProxyServer)optional
  The proxy server to be used for FTP requests.
- proxyForHttp
  [ProxyServer](#type-ProxyServer)optional
  The proxy server to be used for HTTP requests.
- proxyForHttps
  [ProxyServer](#type-ProxyServer)optional
  The proxy server to be used for HTTPS requests.
- singleProxy
  [ProxyServer](#type-ProxyServer)optional
  The proxy server to be used for all per-URL requests (that is http, https, and ftp).

### ProxyServer

An object encapsulating a single proxy server's specification.

#### Properties

- host
  string
  The hostname or IP address of the proxy server. Hostnames must be in ASCII (in Punycode format). IDNA is not supported, yet.
- port
  number optional
  The port of the proxy server. Defaults to a port that depends on the scheme.
- scheme
  [Scheme](#type-Scheme)optional
  The scheme (protocol) of the proxy server itself. Defaults to 'http'.

### Scheme

Chrome 54+

#### Enum

"http"

"https"

"quic"

"socks4"

"socks5"

## Properties

### settings

Proxy settings to be used. The value of this setting is a ProxyConfig object.

#### Type

[types.ChromeSetting](https://developer.chrome.com/docs/extensions/reference/types/#type-ChromeSetting)<[ProxyConfig](#type-ProxyConfig)>

## Events

### onProxyError

```
chrome.proxy.onProxyError.addListener(
  callback: function,
)
```

Notifies about proxy errors.

#### Parameters

- callback
  function

                            The `callback` parameter looks like:

```
(details: object) => void
```

- details
  object

- details
  string
  Additional details about the error such as a JavaScript runtime error.
- error
  string
  The error description.
- fatal
  boolean
  If true, the error was fatal and the network transaction was aborted. Otherwise, a direct connection is used instead.
  Except as otherwise noted, the content of this page is licensed under the [Creative Commons Attribution 4.0 License](https://creativecommons.org/licenses/by/4.0/), and code samples are licensed under the [Apache 2.0 License](https://www.apache.org/licenses/LICENSE-2.0). For details, see the [Google Developers Site Policies](https://developers.google.com/site-policies). Java is a registered trademark of Oracle and/or its affiliates.
  Last updated 2025-08-11 UTC.
  [[["Easy to understand","easyToUnderstand","thumb-up"],["Solved my problem","solvedMyProblem","thumb-up"],["Other","otherUp","thumb-up"]],[["Missing the information I need","missingTheInformationINeed","thumb-down"],["Too complicated / too many steps","tooComplicatedTooManySteps","thumb-down"],["Out of date","outOfDate","thumb-down"],["Samples / code issue","samplesCodeIssue","thumb-down"],["Other","otherDown","thumb-down"]],["Last updated 2025-08-11 UTC."],[],[]]
