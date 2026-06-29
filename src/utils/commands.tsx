import React from 'react';
import { useFileSystemStore } from '../store/useFileSystemStore';
import { PythonInterpreter } from '../components/PythonInterpreter';

const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

export const executeCommand = async (
  commandLine: string, 
  terminalUser: string, 
  currentPath: string, 
  setCurrentPath: (path: string) => void
): Promise<React.ReactNode> => {
  const args = commandLine.trim().split(/\s+/);
  const cmd = args[0].toLowerCase();
  const fs = useFileSystemStore.getState();

  switch (cmd) {
    case 'help':
      return (
        <div className="text-gray-300">
          <div className="mb-2">Kali Web OS - Simulated Environment</div>
          <div className="mb-2 text-yellow-400">Note: Many commands are simulated via AI. Try any standard Linux command!</div>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-x-2 gap-y-1 mt-2 text-sm">
            <div><span className="text-green-400">help</span></div>
            <div><span className="text-green-400">ai</span></div>
            <div><span className="text-green-400">clear</span></div>
            <div><span className="text-green-400">ls</span></div>
            <div><span className="text-green-400">cd</span></div>
            <div><span className="text-green-400">pwd</span></div>
            <div><span className="text-green-400">cat</span></div>
            <div><span className="text-green-400">mkdir</span></div>
            <div><span className="text-green-400">touch</span></div>
            <div><span className="text-green-400">rm</span></div>
            <div><span className="text-green-400">cp</span></div>
            <div><span className="text-green-400">mv</span></div>
            <div><span className="text-green-400">whoami</span></div>
            <div><span className="text-green-400">date</span></div>
            <div><span className="text-green-400">cal</span></div>
            <div><span className="text-green-400">uname</span></div>
            <div><span className="text-green-400">hostname</span></div>
            <div><span className="text-green-400">uptime</span></div>
            <div><span className="text-green-400">echo</span></div>
            <div><span className="text-green-400">ping</span></div>
            <div><span className="text-green-400">ifconfig</span></div>
            <div><span className="text-green-400">ip</span></div>
            <div><span className="text-green-400">cowsay</span></div>
            <div><span className="text-green-400">figlet</span></div>
            <div><span className="text-green-400">sudo su</span></div>
            <div><span className="text-green-400">exit</span></div>
            <div><span className="text-green-400">apt</span></div>
            <div><span className="text-green-400">neofetch</span></div>
            <div><span className="text-green-400">nmap</span></div>
            <div><span className="text-green-400">sqlmap</span></div>
            <div><span className="text-green-400">msfconsole</span></div>
            <div><span className="text-green-400">hydra</span></div>
            <div><span className="text-green-400">john</span></div>
            <div><span className="text-green-400">aircrack-ng</span></div>
            <div><span className="text-green-400">top</span></div>
            <div><span className="text-green-400">ps</span></div>
            <div><span className="text-green-400">tar</span></div>
            <div><span className="text-green-400">git clone</span></div>
            <div><span className="text-green-400">python3</span></div>
          </div>
          <div className="mt-2 text-gray-400 italic">...and hundreds more supported via AI simulation.</div>
        </div>
      );

    case 'clear':
      return <div className="h-[1000px]"></div>;

    case 'ai': {
      const promptText = args.slice(1).join(' ');
      if (!promptText) {
        return (
          <div className="text-gray-400">
            <div className="text-cyan-400 font-bold mb-1">Kali AI CLI Agent</div>
            <div>Usage: <span className="text-green-400">ai [your prompt or question]</span></div>
            <div>Example: <span className="text-green-400">ai how to run an nmap syn scan</span></div>
            <div className="mt-1 text-xs text-gray-500">Note: Uses .env API keys or Offline mode automatically!</div>
          </div>
        );
      }

      try {
        const { useAIStore } = await import('../store/useAIStore');
        const { queryAI } = await import('./aiService');
        
        const aiState = useAIStore.getState();
        const activeProvider = aiState.activeProvider;
        const currentConfig = aiState.configs[activeProvider];

        // Let queryAI execute directly so server-side .env keys or offline modes work seamlessly
        const response = await queryAI(activeProvider, currentConfig, promptText, []);
        return (
          <div className="text-gray-200 whitespace-pre-wrap font-mono bg-[#111] p-3 rounded border border-[#2d2d2d] leading-relaxed">
            <div className="text-xs text-cyan-400 font-bold mb-2 uppercase">Kali AI Assistant ({currentConfig.model})</div>
            {response}
          </div>
        );
      } catch (err: any) {
        return <div className="text-red-400">Error: {err.message}</div>;
      }
    }

    case 'pwd':
      return <div>{currentPath}</div>;

    case 'whoami':
      return <div>{terminalUser}</div>;

    case 'date':
      return <div>{new Date().toString()}</div>;

    case 'ls': {
      const targetPath = args[1] || currentPath;
      const contents = fs.readDir(targetPath);
      if (!contents) return <div className="text-red-400">ls: cannot access '{targetPath}': No such file or directory</div>;
      
      return (
        <div className="flex flex-wrap gap-4">
          {Object.values(contents).map((item) => (
            <span key={item.name} className={item.type === 'dir' ? 'text-blue-400 font-bold' : 'text-gray-300'}>
              {item.name}
            </span>
          ))}
        </div>
      );
    }

    case 'cd': {
      const targetPath = args[1] || `/home/${terminalUser === 'root' ? 'kali' : terminalUser}`;
      const resolvedPath = fs.resolvePath(targetPath);
      const node = fs.getFile(resolvedPath);
      
      if (!node) {
        return <div className="text-red-400">cd: {targetPath}: No such file or directory</div>;
      }
      if (node.type !== 'dir') {
        return <div className="text-red-400">cd: {targetPath}: Not a directory</div>;
      }
      
      setCurrentPath(resolvedPath);
      return null;
    }

    case 'cat': {
      if (!args[1]) return <div className="text-red-400">cat: missing operand</div>;
      const content = fs.readFile(args[1]);
      if (content === null) return <div className="text-red-400">cat: {args[1]}: No such file or directory</div>;
      return <div className="whitespace-pre-wrap">{content}</div>;
    }

    case 'mkdir': {
      if (!args[1]) return <div className="text-red-400">mkdir: missing operand</div>;
      const success = fs.mkdir(args[1]);
      if (!success) return <div className="text-red-400">mkdir: cannot create directory '{args[1]}': File exists or parent does not exist</div>;
      return null;
    }

    case 'touch': {
      if (!args[1]) return <div className="text-red-400">touch: missing operand</div>;
      const success = fs.writeFile(args[1], '');
      if (!success) return <div className="text-red-400">touch: cannot touch '{args[1]}': No such file or directory</div>;
      return null;
    }

    case 'rm': {
      if (!args[1]) return <div className="text-red-400">rm: missing operand</div>;
      const success = fs.rm(args[1]);
      if (!success) return <div className="text-red-400">rm: cannot remove '{args[1]}': No such file or directory</div>;
      return null;
    }

    case 'nmap': {
      const target = args[1] || '127.0.0.1';
      await delay(1000);
      return (
        <div className="text-gray-300">
          <div>Starting Nmap 7.93 ( https://nmap.org ) at {new Date().toISOString()}</div>
          <div className="mt-2">Nmap scan report for {target}</div>
          <div>Host is up (0.00013s latency).</div>
          <div className="mt-2">Not shown: 997 closed tcp ports (reset)</div>
          <div className="grid grid-cols-3 gap-4 mt-2 font-bold">
            <div>PORT</div><div>STATE</div><div>SERVICE</div>
            <div className="text-green-400 font-normal">22/tcp</div><div className="text-green-400 font-normal">open</div><div className="text-green-400 font-normal">ssh</div>
            <div className="text-green-400 font-normal">80/tcp</div><div className="text-green-400 font-normal">open</div><div className="text-green-400 font-normal">http</div>
            <div className="text-green-400 font-normal">443/tcp</div><div className="text-green-400 font-normal">open</div><div className="text-green-400 font-normal">https</div>
          </div>
          <div className="mt-4">Nmap done: 1 IP address (1 host up) scanned in 1.42 seconds</div>
        </div>
      );
    }

    case 'sqlmap': {
      const target = args.find(a => a.startsWith('http')) || 'http://example.com/vuln.php?id=1';
      await delay(1500);
      return (
        <div className="text-gray-300">
          <div className="text-yellow-400">        ___</div>
          <div className="text-yellow-400">       __H__</div>
          <div className="text-yellow-400"> ___ ___["]_____ ___ ___  {'{'}1.7.2#stable{'}'}</div>
          <div className="text-yellow-400">|_ -| . [,]     | .'| . |</div>
          <div className="text-yellow-400">|___|_  ["]_|_|_|__,|  _|</div>
          <div className="text-yellow-400">      |_|V...       |_|   https://sqlmap.org</div>
          <br/>
          <div>[*] starting @ {new Date().toISOString()}</div>
          <div className="mt-2">[INFO] testing connection to the target URL</div>
          <div className="mt-1">[INFO] checking if the target is protected by some kind of WAF/IPS</div>
          <div className="mt-1">[INFO] testing if the target URL content is stable</div>
          <div className="mt-1">[INFO] target URL content is stable</div>
          <div className="mt-1">[INFO] testing if GET parameter 'id' is dynamic</div>
          <div className="mt-1 text-green-400">[INFO] GET parameter 'id' appears to be dynamic</div>
          <div className="mt-1">[INFO] heuristic (basic) test shows that GET parameter 'id' might be injectable (possible DBMS: 'MySQL')</div>
          <div className="mt-2 text-green-400 font-bold">GET parameter 'id' is vulnerable. Do you want to keep testing the others (if any)? [y/N] N</div>
          <div className="mt-2">sqlmap identified the following injection point(s) with a total of 46 HTTP(s) requests:</div>
          <div className="mt-2">---</div>
          <div>Parameter: id (GET)</div>
          <div>    Type: boolean-based blind</div>
          <div>    Title: AND boolean-based blind - WHERE or HAVING clause</div>
          <div>    Payload: id=1 AND 7778=7778</div>
          <div className="mt-2">    Type: error-based</div>
          <div>    Title: MySQL &gt;= 5.0 AND error-based - WHERE, HAVING, ORDER BY or GROUP BY clause (FLOOR)</div>
          <div>    Payload: id=1 AND (SELECT 1435 FROM(SELECT COUNT(*),CONCAT(0x7170706a71,(SELECT (ELT(1435=1435,1))),0x717a7a7071,FLOOR(RAND(0)*2))x FROM INFORMATION_SCHEMA.PLUGINS GROUP BY x)a)</div>
          <div>---</div>
          <div className="mt-2">[INFO] the back-end DBMS is MySQL</div>
          <div>web server operating system: Linux Ubuntu</div>
          <div>web application technology: Nginx 1.18.0, PHP 7.4.3</div>
          <div>back-end DBMS: MySQL &gt;= 5.0</div>
          <div className="mt-2">[*] ending @ {new Date().toISOString()}</div>
        </div>
      );
    }

    case 'neofetch': {
      return (
        <div className="flex gap-4 text-gray-300">
          <div className="text-blue-500 font-bold whitespace-pre">
{`       _,met$$$$$gg.
    ,g$$$$$$$$$$$$$$$P.
  ,g$$P"     """Y$$.".
 ,$$P'              \`$$$.
',$$P       ,ggs.     \`$$b:
\`d$$'     ,$P"'   .    $$$
 $$P      d$'     ,    $$P
 $$:      $$.   -    ,d$$'
 $$;      Y$b._   _,d$P'
 Y$$.    \`.\`"Y$$$$P"'
 \`$$b      "-.__
  \`Y$$
   \`Y$$.
     \`$$b.
       \`Y$$b.
          \`"Y$b._
              \`"""`}
          </div>
          <div>
            <div className="text-blue-400 font-bold">{terminalUser}<span className="text-white">@</span>kali</div>
            <div>-----------------</div>
            <div><span className="text-blue-400 font-bold">OS</span>: Kali GNU/Linux Rolling x86_64</div>
            <div><span className="text-blue-400 font-bold">Host</span>: Web Browser (Simulated)</div>
            <div><span className="text-blue-400 font-bold">Kernel</span>: 6.1.0-kali5-amd64</div>
            <div><span className="text-blue-400 font-bold">Uptime</span>: 1 hour, 23 mins</div>
            <div><span className="text-blue-400 font-bold">Packages</span>: 2451 (dpkg)</div>
            <div><span className="text-blue-400 font-bold">Shell</span>: bash 5.2.15</div>
            <div><span className="text-blue-400 font-bold">Resolution</span>: 1920x1080</div>
            <div><span className="text-blue-400 font-bold">DE</span>: GNOME 43.2</div>
            <div><span className="text-blue-400 font-bold">WM</span>: Mutter</div>
            <div><span className="text-blue-400 font-bold">Theme</span>: Kali-Dark [GTK2/3]</div>
            <div><span className="text-blue-400 font-bold">Icons</span>: Flat-Remix-Blue-Dark [GTK2/3]</div>
            <div><span className="text-blue-400 font-bold">Terminal</span>: qterminal</div>
            <div><span className="text-blue-400 font-bold">CPU</span>: Virtual Web CPU @ 3.200GHz</div>
            <div><span className="text-blue-400 font-bold">Memory</span>: 2048MiB / 16384MiB</div>
            <div className="mt-2 flex gap-1">
              <div className="w-4 h-4 bg-black"></div>
              <div className="w-4 h-4 bg-red-500"></div>
              <div className="w-4 h-4 bg-green-500"></div>
              <div className="w-4 h-4 bg-yellow-500"></div>
              <div className="w-4 h-4 bg-blue-500"></div>
              <div className="w-4 h-4 bg-purple-500"></div>
              <div className="w-4 h-4 bg-cyan-500"></div>
              <div className="w-4 h-4 bg-white"></div>
            </div>
          </div>
        </div>
      );
    }

    case 'cp': {
      if (!args[1] || !args[2]) return <div className="text-red-400">cp: missing file operand</div>;
      const success = fs.copyNode(args[1], args[2]);
      if (!success) return <div className="text-red-400">cp: cannot copy '{args[1]}' to '{args[2]}': No such file or directory</div>;
      return null;
    }

    case 'mv': {
      if (!args[1] || !args[2]) return <div className="text-red-400">mv: missing file operand</div>;
      const success = fs.moveNode(args[1], args[2]);
      if (!success) return <div className="text-red-400">mv: cannot move '{args[1]}' to '{args[2]}': No such file or directory</div>;
      return null;
    }

    case 'uname': {
      if (args[1] === '-a') return <div>Linux kali 6.1.0-kali5-amd64 #1 SMP PREEMPT_DYNAMIC Debian 6.1.12-1kali2 (2026-02-23) x86_64 GNU/Linux</div>;
      return <div>Linux</div>;
    }

    case 'hostname': {
      if (args[1] === '-I') return <div>192.168.1.105 10.0.2.15</div>;
      return <div>kali</div>;
    }

    case 'uptime': {
      return <div>{new Date().toLocaleTimeString()} up 1:23,  1 user,  load average: 0.00, 0.01, 0.05</div>;
    }

    case 'cal': {
      return (
        <pre className="text-gray-300">
{`    April 2026      
Su Mo Tu We Th Fr Sa
          1  2  3  4
 5  6  7  8  9 10 11
12 13 14 15 16 17 18
19 20 21 22 23 24 25
26 27 28 29 30`}
        </pre>
      );
    }

    case 'ping': {
      const target = args[1] || '8.8.8.8';
      await delay(1000);
      return (
        <div className="text-gray-300">
          <div>PING {target} ({target}) 56(84) bytes of data.</div>
          <div>64 bytes from {target}: icmp_seq=1 ttl=117 time=14.2 ms</div>
          <div>64 bytes from {target}: icmp_seq=2 ttl=117 time=13.8 ms</div>
          <div>64 bytes from {target}: icmp_seq=3 ttl=117 time=14.5 ms</div>
          <div>64 bytes from {target}: icmp_seq=4 ttl=117 time=14.1 ms</div>
          <div>--- {target} ping statistics ---</div>
          <div>4 packets transmitted, 4 received, 0% packet loss, time 3004ms</div>
          <div>rtt min/avg/max/mdev = 13.812/14.150/14.501/0.250 ms</div>
        </div>
      );
    }

    case 'ifconfig':
    case 'ip': {
      return (
        <pre className="text-gray-300">
{`eth0: flags=4163<UP,BROADCAST,RUNNING,MULTICAST>  mtu 1500
        inet 192.168.1.105  netmask 255.255.255.0  broadcast 192.168.1.255
        inet6 fe80::a00:27ff:fe4e:66a1  prefixlen 64  scopeid 0x20<link>
        ether 08:00:27:4e:66:a1  txqueuelen 1000  (Ethernet)
        RX packets 12345  bytes 12345678 (11.7 MiB)
        RX errors 0  dropped 0  overruns 0  frame 0
        TX packets 54321  bytes 87654321 (83.5 MiB)
        TX errors 0  dropped 0 overruns 0  carrier 0  collisions 0

lo: flags=73<UP,LOOPBACK,RUNNING>  mtu 65536
        inet 127.0.0.1  netmask 255.0.0.0
        inet6 ::1  prefixlen 128  scopeid 0x10<host>
        loop  txqueuelen 1000  (Local Loopback)
        RX packets 100  bytes 10000 (9.7 KiB)
        RX errors 0  dropped 0  overruns 0  frame 0
        TX packets 100  bytes 10000 (9.7 KiB)
        TX errors 0  dropped 0 overruns 0  carrier 0  collisions 0`}
        </pre>
      );
    }

    case 'cowsay': {
      const text = args.slice(1).join(' ') || 'Moo';
      const border = '-'.repeat(text.length + 2);
      return (
        <pre className="text-gray-300">
{` ${border}
< ${text} >
 ${border}
        \\   ^__^
         \\  (oo)\\_______
            (__)\\       )\\/\\
                ||----w |
                ||     ||`}
        </pre>
      );
    }

    case 'figlet': {
      const text = args.slice(1).join(' ') || 'Kali';
      return (
        <pre className="text-blue-400 font-bold">
{`
 _  __     _ _ 
| |/ /__ _| (_)
| ' // _\` | | |
| . \\ (_| | | |
|_|\\_\\__,_|_|_|
`}
        </pre>
      );
    }

    case 'echo': {
      const text = args.slice(1).join(' ');
      return <div>{text}</div>;
    }

    case 'apt':
    case 'apt-get': {
      if (args[1] === 'update') {
        await delay(1000);
        return (
          <div className="text-gray-300">
            <div>Hit:1 http://kali.download/kali kali-rolling InRelease</div>
            <div>Reading package lists... Done</div>
          </div>
        );
      }
      if (args[1] === 'install') {
        const pkg = args[2] || 'package';
        await delay(1000);
        return (
          <div className="text-gray-300">
            <div>Reading package lists... Done</div>
            <div>Building dependency tree... Done</div>
            <div>Reading state information... Done</div>
            <div>The following NEW packages will be installed:</div>
            <div>  {pkg}</div>
            <div>0 upgraded, 1 newly installed, 0 to remove and 0 not upgraded.</div>
            <div>Need to get 1,024 kB of archives.</div>
            <div>After this operation, 3,072 kB of additional disk space will be used.</div>
            <div className="text-yellow-400">Get:1 http://kali.download/kali kali-rolling/main amd64 {pkg} [1,024 kB]</div>
            <div>Fetched 1,024 kB in 1s (1,024 kB/s)</div>
            <div>Selecting previously unselected package {pkg}.</div>
            <div>(Reading database ... 314159 files and directories currently installed.)</div>
            <div>Preparing to unpack .../{pkg}.deb ...</div>
            <div>Unpacking {pkg} ...</div>
            <div>Setting up {pkg} ...</div>
          </div>
        );
      }
      return <div className="text-red-400">apt: missing operation</div>;
    }

    case 'free':
      return (
        <pre className="text-gray-300">
{`               total        used        free      shared  buff/cache   available
Mem:         8096256     2145280     3152896      154624     2798080     5543936
Swap:        2097148           0     2097148`}
        </pre>
      );

    case 'df':
      return (
        <pre className="text-gray-300">
{`Filesystem     1K-blocks    Used Available Use% Mounted on
udev             4013112       0   4013112   0% /dev
tmpfs             809628    1544    808084   1% /run
/dev/sda1       51474024 15421320  33405280  32% /
tmpfs            4048128       0   4048128   0% /dev/shm`}
        </pre>
      );

    case 'ps':
    case 'top':
    case 'htop':
      return (
        <pre className="text-gray-300">
{`  PID TTY          TIME CMD
    1 ?        00:00:02 systemd
  543 ?        00:00:00 sshd
 1234 pts/0    00:00:00 bash
 1250 pts/0    00:00:00 ${cmd}`}
        </pre>
      );

    case 'history':
      return (
        <div className="text-gray-300">
          1  ls<br/>
          2  pwd<br/>
          3  whoami<br/>
          4  {commandLine}
        </div>
      );

    case 'tree':
      return (
        <pre className="text-gray-300">
{`.
├── Desktop
├── Documents
│   └── readme.txt
└── Downloads

3 directories, 1 file`}
        </pre>
      );

    case 'msfconsole':
      return (
        <pre className="text-red-500">
{`
      .:okOOOkdc'
    .xOOOOOOOOOOOOc
   :OOOOOOOOOOOOOOOk,
  'OOOOOOOOOkkkkOOOOO:
  oOOOOOOOO.    .oOOOO
  dOOOOOOOO.      .cOO

       =[ metasploit v6.3.5-dev                           ]
+ -- --=[ 2294 exploits - 1201 auxiliary - 409 post       ]
+ -- --=[ 968 payloads - 45 encoders - 11 nops            ]
+ -- --=[ 9 evasion                                       ]

msf6 >`}
        </pre>
      );

    case 'hydra':
      return (
        <pre className="text-gray-300">
{`Hydra v9.4 (c) 2023 by van Hauser/THC - Please do not use in military or secret service organizations, or for illegal purposes.

Syntax: hydra [[[-l LOGIN|-L FILE] [-p PASS|-P FILE]] | [-C FILE]] [-e nsr] [-o FILE] [-t TASKS] [-M FILE [-T TASKS]] [-w TIME] [-W TIME] [-f] [-s PORT] [-x MIN:MAX:CHARSET] [-c TIME] [-IVvwVq] [-S] [-u] [-m DIR] [-d] [-R] server service [OPT]`}
        </pre>
      );

    case 'aircrack-ng':
      return (
        <pre className="text-gray-300">
{`  Aircrack-ng 1.7 

  [00:00:00] 0/0 keys tested (0.00 k/s) 

  Time left: unknown
  Master Key     : A1:B2:C3:D4:E5:F6:78:90:12:34:56:78:90:AB:CD:EF
  Transient Key  : 1A:2B:3C:4D:5E:6F:7A:8B:9C:0D:1E:2F:3A:4B:5C:6D

  KEY FOUND! [ SUPERSECRET ]`}
        </pre>
      );

    case 'john':
    case 'hashcat':
      return (
        <pre className="text-gray-300">
{`Loaded 1 password hash (bcrypt [Blowfish 32/64 X3])
Cost 1 (iteration count) is 1024 for all loaded hashes
Will run 4 OpenMP threads
Press 'q' or Ctrl-C to abort, almost any other key for status
password123      (admin)
1g 0:00:00:00 DONE (2026-04-14 12:00) 1.538g/s 50.00p/s 50.00c/s 50.00C/s 123456..password
Use the "--show" option to display all of the cracked passwords reliably
Session completed`}
        </pre>
      );

    case 'dirb':
    case 'gobuster':
    case 'wpscan':
    case 'nikto':
      return (
        <pre className="text-gray-300">
{`Starting scan...
Target: http://example.com

[+] http://example.com/admin (CODE:403|SIZE:274)
[+] http://example.com/login (CODE:200|SIZE:1250)
[+] http://example.com/uploads (CODE:200|SIZE:854)

Scan completed in 2.5s`}
        </pre>
      );

    case 'netstat':
    case 'ss':
      return (
        <pre className="text-gray-300">
{`Active Internet connections (w/o servers)
Proto Recv-Q Send-Q Local Address           Foreign Address         State
tcp        0      0 192.168.1.105:44322     104.18.32.45:443        ESTABLISHED
tcp        0      0 192.168.1.105:22        192.168.1.50:54321      ESTABLISHED`}
        </pre>
      );

    case 'traceroute':
      return (
        <pre className="text-gray-300">
{`traceroute to 8.8.8.8 (8.8.8.8), 30 hops max, 60 byte packets
 1  192.168.1.1 (192.168.1.1)  1.123 ms  1.045 ms  1.012 ms
 2  10.0.0.1 (10.0.0.1)  15.432 ms  15.321 ms  15.210 ms
 3  8.8.8.8 (8.8.8.8)  20.123 ms  20.045 ms  20.012 ms`}
        </pre>
      );

    case 'searchsploit':
    case 'exploitdb':
      return (
        <pre className="text-gray-300">
{`----------------------------------------- ---------------------------------
 Exploit Title                           |  Path
----------------------------------------- ---------------------------------
WordPress 5.8 - 'Plugin' SQL Injection   | php/webapps/50123.py
Apache 2.4.49 - Path Traversal           | multiple/webapps/50383.sh
----------------------------------------- ---------------------------------`}
        </pre>
      );

    case 'git': {
      const sub = args[1];
      if (sub === 'clone') {
        const repoUrl = args[2];
        if (!repoUrl) {
          return <div className="text-red-400">fatal: You must specify a repository to clone.</div>;
        }

        const { useSystemStore } = await import('../store/useSystemStore');
        const isOnline = useSystemStore.getState().isOnline;

        let repoName = repoUrl.split('/').pop()?.replace('.git', '') || 'cloned_repo';

        if (!isOnline) {
          await delay(1200);
          return (
            <div className="text-red-400 font-mono">
              <div>Cloning into '{repoName}'...</div>
              <div className="mt-1">fatal: Could not resolve host: github.com</div>
              <div className="text-gray-400 text-xs mt-1">💡 Tip: You are offline. Click the 'Offline' button in the desktop taskbar to switch to Online and enable cloning tools!</div>
            </div>
          );
        }

        await delay(2000);
        const targetPath = `${currentPath}/${repoName}`;
        
        fs.mkdir(targetPath);

        // Seed cloned repository files based on repo name
        const lowerRepo = repoName.toLowerCase();
        if (lowerRepo.includes('sqlmap')) {
          repoName = 'sqlmap';
          fs.writeFile(`${targetPath}/README.md`, `# SQLMap\nAutomatic SQL injection and database takeover tool.\n\nRun:\n$ python3 sqlmap.py`);
          fs.writeFile(`${targetPath}/sqlmap.py`, `import time
print("\\x1b[1;33m")
print("        ___")
print("       __H__")
print(" ___ ___[\\"]_____ ___ ___  {1.7.2#stable}")
print("|_ -| . [,]     | .'| . |")
print("|___|_  [\\"]_|_|_|__,|  _|")
print("      |_|V...       |_|   https://sqlmap.org")
print("\\x1b[0m")
time.sleep(0.5)
url = input("Enter target URL: ")
print("[*] testing connection to the target URL")
time.sleep(1.0)
print("[INFO] confirming GET parameter is vulnerable to SQL injection...")
time.sleep(0.8)
print("\\x1b[1;32mSUCCESS: Found vulnerable parameter 'id'! (DBMS: MySQL)\\x1b[0m")
print("Payload: id=1' UNION SELECT NULL, username, password FROM users--")`);
        } else if (lowerRepo.includes('sherlock')) {
          repoName = 'sherlock';
          fs.writeFile(`${targetPath}/README.md`, `# Sherlock\nHunt down social media profiles by username.\n\nRun:\n$ python3 sherlock.py <username>`);
          fs.writeFile(`${targetPath}/sherlock.py`, `import time
print("\\x1b[1;36m")
print(" ._ _  |__  _ ._ |  _   _ |  _ ")
print("  _> | | | |(/_|  | (_) (_ |<(/_")
print("                       v0.14.3")
print("\\x1b[0m")
time.sleep(0.5)
user = input("Enter target username to hunt: ")
print("[*] Searching 350+ social networks for " + user)
time.sleep(1.0)
print("\\x1b[1;32m[+] GitHub: https://github.com/" + user + "\\x1b[0m")
print("\\x1b[1;32m[+] Twitter: https://twitter.com/" + user + "\\x1b[0m")
print("\\x1b[1;32m[+] Instagram: https://instagram.com/" + user + "\\x1b[0m")
print("[*] Search completed. Stay ethical!")`);
        } else if (lowerRepo.includes('nmap')) {
          repoName = 'nmap';
          fs.writeFile(`${targetPath}/README.md`, `# Nmap\nSimulated Script Scanner\n\nRun:\n$ ./nmap.sh`);
          fs.writeFile(`${targetPath}/nmap.sh`, `echo "Running simulated Nmap scanner..."\necho "Scanning localhost (127.0.0.1)..."\necho "Port 80/tcp is OPEN (HTTP)"`);
        } else {
          // Dynamic general Tool/Repository generator! Supports ANY Github Repository cloned!
          const cleanName = repoName.replace(/[-_]/g, ' ');
          const scriptName = repoName.toLowerCase().replace(/[-_]/g, '');

          // 1. README.md
          fs.writeFile(`${targetPath}/README.md`, `# ${cleanName}\nSuccessfully cloned ${cleanName} repository.\n\n## Installation\nRun the setup installer:\n\`\`\`bash\npython3 Setup.py\n\`\`\`\n\n## Run Tool\n\`\`\`bash\npython3 ${scriptName}.py\n\`\`\``);

          // 2. Setup.py / setup.py
          const setupPyContent = `import time
print("\\x1b[1;36m[*] Starting ${cleanName} Setup Installer...\\x1b[0m")
time.sleep(0.5)
print("[+] Target Platform: Linux (Kali WebOS Core)")
time.sleep(0.3)
print("[+] Checking Python version... Python 3.11.2 - OK")
time.sleep(0.4)
print("[+] Installing dependencies from requirements.txt...")
time.sleep(0.8)
print("    - Installing 'requests'... [SUCCESS]")
time.sleep(0.3)
print("    - Installing 'cryptography'... [SUCCESS]")
time.sleep(0.4)
print("[+] Creating binary links in /usr/bin/${scriptName} ...")
time.sleep(0.6)
print("\\x1b[1;32m[+] ${cleanName} has been successfully installed!\\x1b[0m")
time.sleep(0.3)
print("[!] Run: python3 ${scriptName}.py to start the tool suite.");`;

          fs.writeFile(`${targetPath}/Setup.py`, setupPyContent);
          fs.writeFile(`${targetPath}/setup.py`, setupPyContent);

          // 3. requirements.txt
          fs.writeFile(`${targetPath}/requirements.txt`, `requests>=2.31.0\ncryptography>=41.0.1\n`);

          // 4. [scriptName].py (Interactive CLI Utility console!)
          fs.writeFile(`${targetPath}/${scriptName}.py`, `import time
print("\\x1b[1;35m")
print("██████╗ ██╗   ██╗██╗██╗     ██████╗ ██╗    ██╗ █████╗ ██████╗ ███████╗")
print("██╔══██╗██║   ██║██║██║     ██╔══██╗██║    ██║██╔══██╗██╔══██╗██╔════╝")
print("██████╔╝██║   ██║██║██║     ██║  ██║██║ █╗ ██║███████║██████╔╝█████╗  ")
print("██╔══██╗██║   ██║██║██║     ██║  ██║██║███╗██║██╔══██║██╔══██╗██╔══╝  ")
print("██████╔╝╚██████╔╝██║███████╗██████╔╝╚███╔███╔╝██║  ██║██║  ██║███████╗")
print("╚══════╝  ╚═════╝ ╚═╚══════╝╚═════╝  ╚══╝╚══╝ ╚═╝  ╚═╝╚═╝  ╚═╝╚══════╝")
print("                       ${cleanName} Console Utility")
print("\\x1b[0m")
time.sleep(0.4)
print("Select an option to run:")
print(" [1] Vulnerability Audit (Simulated)")
print(" [2] Targeted Wordlist Generator (Simulated)")
print(" [3] Malware Threat Sandbox (Simulated)")
print(" [4] Exit")
print("")
opt = input("${scriptName} > ")
if opt == "1":
    print("[*] Executing security scanner against loopback address...")
    time.sleep(0.8)
    print("[INFO] Querying system ports...")
    time.sleep(0.5)
    print("\\x1b[1;32m[+] Safe! No vulnerabilities detected in local core configuration.\\x1b[0m")
elif opt == "2":
    print("[*] Launching Custom Wordlist Generator...")
    name = input("Enter target person or company name: ")
    year = input("Enter birth year or launch year: ")
    print("[+] Generating targeted combinations for " + name + " " + year + "...")
    time.sleep(0.8)
    print("\\x1b[1;32m[SUCCESS] Generated 142 potential keys. Saved to 'keys.txt'.\\x1b[0m")
elif opt == "3":
    print("[*] Starting Malware Threat Sandbox...")
    time.sleep(0.5)
    print("[INFO] Opening sandbox container...")
    time.sleep(0.6)
    print("\\x1b[1;32m[INFO] Analysis complete. Loaded file is safe to execute.\\x1b[0m")
else:
    print("Exiting ${cleanName}. Stay safe!")`);
        }

        return (
          <div className="text-gray-300 font-mono">
            <div>Cloning into '{repoName}'...</div>
            <div>remote: Enumerating objects: 142, done.</div>
            <div>remote: Counting objects: 100% (142/142), done.</div>
            <div>remote: Compressing objects: 100% (90/90), done.</div>
            <div className="text-green-400">Receiving objects: 100% (12401/12401), 9.34 MiB | 3.82 MiB/s, done.</div>
            <div>Resolving deltas: 100% (5211/5211), done.</div>
            <div className="mt-1 text-green-400 font-bold">Success: Repository cloned into ./{repoName}/</div>
            <div className="text-xs text-gray-400 mt-1">Try: 'cd {repoName}' and run: 'python3 Setup.py' or 'python3 {repoName.toLowerCase().replace(/[-_]/g, "")}.py' !</div>
          </div>
        );
      }
      return (
        <div className="text-gray-400">
          <div>Usage: <span className="text-green-400">git clone [repository-url]</span></div>
          <div>Example: <span className="text-green-400">git clone https://github.com/v4lkyr0/Buildware-Tools.git</span></div>
        </div>
      );
    }

    case 'python':
    case 'python3': {
      const filename = args[1];
      if (!filename) {
        return (
          <div className="text-gray-300">
            <div>Python 3.11.2 (main, Feb 12 2026, 11:20:15)</div>
            <div>[GCC 12.2.0] on linux</div>
            <div>Type "help", "copyright", "credits" or "license" for more information.</div>
            <div className="text-yellow-400 mt-1">(Simulated interactive shell is not supported. Please run with a file, e.g. 'python3 file.py')</div>
          </div>
        );
      }

      // Read file in current directory
      const filePath = filename.startsWith('/') ? filename : `${currentPath}/${filename}`;
      const fileContent = fs.readFile(filePath);
      if (fileContent === null) {
        return <div className="text-red-400 font-mono">python3: can't open file '{filename}': No such file or directory</div>;
      }

      return (
        <PythonInterpreter 
          filename={filename} 
          fileContent={fileContent} 
          initialArgs={args} 
        />
      );
    }

    default:
      if (cmd === '') return null;

      // Handle running scripts locally starting with ./
      if (cmd.startsWith('./')) {
        const filename = cmd.slice(2);
        const filePath = `${currentPath}/${filename}`;
        const fileContent = fs.readFile(filePath);
        if (fileContent === null) {
          return <div className="text-red-400">bash: {cmd}: No such file or directory</div>;
        }
        
        if (filename.endsWith('.py')) {
          return (
            <PythonInterpreter 
              filename={filename} 
              fileContent={fileContent} 
              initialArgs={[filename]} 
            />
          );
        }

        await delay(500);
        return (
          <div className="text-gray-300 font-mono">
            <div className="text-xs text-gray-500">--- Running script {filename} ---</div>
            <div className="whitespace-pre-wrap mt-1 text-green-400">{fileContent}</div>
            <div className="text-xs text-gray-500 mt-2">--- Script finished successfully ---</div>
          </div>
        );
      }
      
      const knownOfflineCommands = [
        'cal', 'uname', 'hostname', 'uptime', 'echo', 'exit', 'history', 'help', 'man',
        'mkdir', 'rmdir', 'rm', 'touch', 'cp', 'mv', 'cat', 'nano', 'head', 'tail', 'less', 'more', 'tree', 'stat', 'file',
        'find', 'locate', 'which', 'whereis', 'grep', 'awk', 'sed', 'cut', 'sort', 'uniq', 'wc',
        'chmod', 'chown', 'chgrp', 'sudo', 'su', 'adduser', 'deluser', 'passwd', 'who', 'id', 'groups', 'logout',
        'top', 'htop', 'ps', 'kill', 'killall', 'free', 'df', 'du', 'vmstat', 'iostat', 'watch',
        'ifconfig', 'ip', 'ping', 'netstat', 'ss', 'traceroute', 'route', 'arp', 'curl', 'wget',
        'apt', 'dpkg', 'tar', 'gzip', 'gunzip', 'zip', 'unzip', 'rar', 'unrar',
        'lsblk', 'fdisk', 'mount', 'umount', 'blkid',
        'nmap', 'sqlmap', 'hydra', 'aircrack-ng', 'nikto', 'msfconsole', 'msfvenom', 'dirb', 'gobuster', 'wpscan', 'john', 'hashcat', 'theHarvester', 'recon-ng', 'setoolkit', 'bettercap', 'dnsenum', 'dnsmap', 'enum4linux', 'nbtscan',
        'airmon-ng', 'airodump-ng', 'aireplay-ng', 'airbase-ng', 'wash', 'reaver', 'bully', 'mdk3',
        'cewl', 'crunch', 'searchsploit', 'exploitdb',
        'banner', 'fortune', 'cowsay', 'toilet', 'figlet', 'yes', 'sleep'
      ];

      if (knownOfflineCommands.includes(cmd)) {
         return <div className="text-gray-300">[{cmd}] executed successfully (Offline Simulation)</div>;
      }
      
      return <div className="text-red-400">{cmd}: command not found</div>;
  }
};
