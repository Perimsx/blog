$ErrorActionPreference = "Stop"

$root = Split-Path -Path $PSScriptRoot -Parent
$coversDir = Join-Path $root "src/content/blog/covers"
$tempDir = Join-Path $coversDir "_refresh_20260328"
$manifestPath = Join-Path $tempDir "manifest.json"

if (Test-Path $tempDir) {
  Remove-Item $tempDir -Recurse -Force
}

New-Item -ItemType Directory -Path $tempDir | Out-Null

$posts = @(
  @{ slug = "ai001"; title = "2026AI大模型格局"; queries = @("artificial intelligence datacenter", "artificial intelligence technology", "machine learning abstract") },
  @{ slug = "algo001"; title = "十大排序算法详解"; queries = @("sorting algorithm data visualization", "code data visualization", "algorithm abstract") },
  @{ slug = "algo002"; title = "动态规划核心思路"; queries = @("dynamic programming code abstract", "algorithm code abstract", "data structure code") },
  @{ slug = "algo003"; title = "图算法遍历与最短路"; queries = @("graph network nodes visualization", "network graph abstract", "graph algorithm") },
  @{ slug = "sec001"; title = "网络安全威胁与防护"; queries = @("cybersecurity shield technology", "network security abstract", "cyber defense") },
  @{ slug = "sec002"; title = "TCPIP协议安全分析"; queries = @("network protocol data packets", "internet network diagram", "tcp ip network") },
  @{ slug = "sec003"; title = "常见网络攻击手法详解"; queries = @("cyber attack abstract", "computer network attack", "cybersecurity incident") },
  @{ slug = "sec004"; title = "密码学基础与应用"; queries = @("cryptography encryption lock", "data encryption technology", "cyber security lock") },
  @{ slug = "sec005"; title = "网络安全合规要求解读"; queries = @("cybersecurity compliance documents", "risk compliance audit", "information security compliance") },
  @{ slug = "sec007"; title = "IDS IPS部署实战"; queries = @("intrusion detection security operations center", "network monitoring cybersecurity", "intrusion detection system") },
  @{ slug = "sec008"; title = "VPN技术与搭建实战"; queries = @("virtual private network server", "vpn network security", "encrypted network tunnel") },
  @{ slug = "sec009"; title = "WAF配置与防护实战"; queries = @("web application firewall server", "web security server", "application firewall") },
  @{ slug = "sec010"; title = "网络流量分析抓包实战"; queries = @("packet capture network analysis", "wireshark network traffic", "network traffic dashboard") },
  @{ slug = "sec011"; title = "堡垒机与零信任实践"; queries = @("zero trust access security", "identity access security", "enterprise security access") },
  @{ slug = "sec012"; title = "威胁情报与ATT&CK"; queries = @("threat intelligence dashboard", "cyber threat analysis", "security intelligence") },
  @{ slug = "sec013"; title = "SIEM平台搭建实战"; queries = @("security operations center monitors", "siem dashboard", "security analytics dashboard") },
  @{ slug = "sec014"; title = "恶意软件分析入门"; queries = @("computer malware analysis", "malware analysis", "reverse engineering computer") },
  @{ slug = "sec015"; title = "异常流量检测与感知"; queries = @("network anomaly detection dashboard", "security analytics monitoring", "anomaly detection technology") },
  @{ slug = "sec017"; title = "应急响应流程与方法"; queries = @("incident response war room", "cybersecurity incident response", "security operations team") },
  @{ slug = "sec018"; title = "Windows应急响应实战"; queries = @("windows digital forensics", "computer forensics workstation", "incident response computer") },
  @{ slug = "sec019"; title = "Linux应急响应实战"; queries = @("linux incident response terminal", "digital forensics computer", "server incident response") },
  @{ slug = "sec020"; title = "漏洞扫描与风险评估"; queries = @("vulnerability scanning dashboard", "risk assessment cybersecurity", "security scanning") },
  @{ slug = "sec021"; title = "安全加固与基线核查"; queries = @("server hardening cybersecurity", "security baseline server", "system security audit") },
  @{ slug = "sec022"; title = "Kali环境搭建指南"; queries = @("kali linux laptop terminal", "penetration testing linux", "cybersecurity terminal") },
  @{ slug = "sec023"; title = "信息收集与目标侦察"; queries = @("cyber reconnaissance map", "digital investigation map", "target reconnaissance cybersecurity") },
  @{ slug = "sec024"; title = "Linux服务漏洞利用"; queries = @("linux server cybersecurity", "linux server terminal", "server exploit security") },
  @{ slug = "sec025"; title = "提权技术与利用详解"; queries = @("privilege escalation linux security", "linux hacker terminal", "cybersecurity terminal") },
  @{ slug = "sec026"; title = "Linux后渗透与持久化"; queries = @("linux persistence terminal", "linux post exploitation", "server shell cybersecurity") },
  @{ slug = "sec027"; title = "Metasploit渗透实战"; queries = @("penetration testing laptop", "ethical hacking workstation", "cybersecurity testing") },
  @{ slug = "sec028"; title = "Windows渗透环境搭建"; queries = @("windows server lab", "windows server terminal", "it lab server") },
  @{ slug = "sec029"; title = "Windows端口攻击面分析"; queries = @("windows server ports network", "server attack surface", "windows server security") },
  @{ slug = "sec030"; title = "Windows提权技术实战"; queries = @("windows privilege escalation cybersecurity", "windows administrator security", "windows security terminal") },
  @{ slug = "sec031"; title = "域渗透与横向移动基础"; queries = @("active directory network security", "enterprise network security", "domain network cybersecurity") },
  @{ slug = "sec032"; title = "Windows后渗透实战"; queries = @("windows command line cybersecurity", "kerberos security windows", "windows post exploitation") }
)

function Get-OpenverseUri([string]$Query) {
  $escapedQuery = [uri]::EscapeDataString($Query)
  return "https://api.openverse.org/v1/images/?q=$escapedQuery&page_size=20&license=cc0,pdm,by,by-sa&extension=jpg,jpeg,png,webp"
}

function Select-ImageForPost($Post) {
  $queries = @($Post.queries)

  if ($Post.slug.StartsWith("sec")) {
    $queries += @("cybersecurity technology", "computer security")
  } elseif ($Post.slug.StartsWith("algo")) {
    $queries += @("algorithm abstract", "code visualization")
  } elseif ($Post.slug.StartsWith("ai")) {
    $queries += @("artificial intelligence", "machine learning")
  }

  foreach ($query in $queries) {
    try {
      $response = Invoke-RestMethod -Uri (Get-OpenverseUri $query)
    } catch {
      continue
    }

    $candidates = @(
      $response.results | Where-Object {
        $_.mature -ne $true -and
        $_.url -and
        $_.width -ge 1000 -and
        $_.height -ge 600 -and
        $_.width -gt $_.height
      }
    )

    foreach ($candidate in $candidates) {
      $parsedUrl = [uri]$candidate.url
      $extension = [System.IO.Path]::GetExtension($parsedUrl.AbsolutePath)
      if ([string]::IsNullOrWhiteSpace($extension)) {
        $extension = ".img"
      }

      $rawPath = Join-Path $tempDir ($Post.slug + $extension)

      try {
        Invoke-WebRequest -Uri $candidate.url -OutFile $rawPath -Headers @{
          Referer = "https://openverse.org/"
          "User-Agent" = "Mozilla/5.0"
        }

        if ((Get-Item $rawPath).Length -lt 51200) {
          Remove-Item $rawPath -Force
          continue
        }

        return [pscustomobject]@{
          slug = $Post.slug
          title = $Post.title
          query = $query
          rawPath = $rawPath
          sourceTitle = $candidate.title
          creator = $candidate.creator
          license = $candidate.license
          licenseVersion = $candidate.license_version
          licenseUrl = $candidate.license_url
          landingUrl = $candidate.foreign_landing_url
          originalUrl = $candidate.url
        }
      } catch {
        if (Test-Path $rawPath) {
          Remove-Item $rawPath -Force
        }
      }
    }
  }

  throw "No usable image found for $($Post.slug)"
}

$manifest = @()

foreach ($post in $posts) {
  $selected = Select-ImageForPost $post
  $manifest += $selected
  Write-Host "Downloaded $($selected.slug) <- $($selected.query)"
}

$manifest | ConvertTo-Json -Depth 6 | Set-Content -Path $manifestPath -Encoding utf8
Write-Host "Manifest saved to $manifestPath"
