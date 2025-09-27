export const defaultPreferences: Preferences = {
    ip: {
        name: 'IP',
        active: true,
        flags: [
            {
                name: 'Copy IP',
                value: true,
                subFlags: [{ name: 'Sanitise IP', value: true }],
            },
        ],
        urls: [
            'abuseipdb.com/check/{ip}',
            'threatfox.abuse.ch/browse.php?search=ioc%3A{ip}',
            'shodan.io/host/{ip}',
        ],
        version: 2,
    },

    hash: {
        name: 'Hash',
        active: true,
        flags: [{ name: 'Copy Hash', value: true }],
        urls: [
            'virustotal.com/gui/file/{hash}',
            'urlhaus.abuse.ch/browse.php?search={hash}',
        ],
        version: 2,
    },
    url: {
        name: 'URL',
        active: true,
        flags: [
            {
                name: 'Copy URL',
                value: true,
                subFlags: [{ name: 'Sanitise URL', value: true }],
            },
        ],
        urls: [
            'urlhaus.abuse.ch/browse.php?search={encodedUrl}',
            'mxtoolbox.com/SuperTool.aspx?action=whois%3a{domain}',
            'virustotal.com/gui/domain/{domain}',
        ],
        version: 2,
    },
};

export type Flag = {
    name: string;
    value: boolean;
    subFlags?: Flag[];
};

export type IOCDefinition = {
    name: string;
    active: boolean;
    flags: Flag[];
    urls: string[];
    version: number;
};

export type Preferences = {
    [key: string]: IOCDefinition;
};
