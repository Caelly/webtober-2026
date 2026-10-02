param([string]$Voice = 'Microsoft Hortense Desktop')
$ErrorActionPreference = 'Stop'
$projectRoot = Split-Path -Parent $PSScriptRoot
Push-Location -LiteralPath $projectRoot
try {
  node --input-type=module -e "import {stories} from './2/src/stories.js'; import {writeFileSync} from 'node:fs';writeFileSync('./2/audio-source.json',JSON.stringify(stories));"
  if ($LASTEXITCODE -ne 0) { throw 'Unable to export stories.' }
  Add-Type -AssemblyName System.Speech
  Add-Type -ReferencedAssemblies 'System.Speech' -TypeDefinition @'
using System;
using System.Collections.Generic;
using System.Speech.Synthesis;
using System.Speech.AudioFormat;
public class RelicWord {
    public int position;
    public int length;
    public double time;
}
public static class RelicAudio {
    public static RelicWord[] Generate(string voice, string text, string path) {
        var words = new List<RelicWord>();
        using (var synth = new SpeechSynthesizer()) {
            synth.SelectVoice(voice);
            synth.Rate = 0;
            synth.SetOutputToWaveFile(path, new SpeechAudioFormatInfo(16000, AudioBitsPerSample.Sixteen, AudioChannel.Mono));
            synth.SpeakProgress += (sender, e) => {
                lock(words) words.Add(new RelicWord { position = e.CharacterPosition, length = e.CharacterCount, time = e.AudioPosition.TotalSeconds });
            };
            synth.Speak(text);
            synth.SetOutputToNull();
        }
        return words.ToArray();
    }
}
'@
  $storyData = Get-Content -LiteralPath './2/audio-source.json' -Raw -Encoding UTF8 | ConvertFrom-Json
  $audioRoot = Join-Path $projectRoot '2/audio'
  New-Item -ItemType Directory -Path $audioRoot -Force | Out-Null
  $timings = [ordered]@{}
  foreach ($story in $storyData) {
    $prefix = $story.title + '. '
    $file = Join-Path $audioRoot ($story.id + '.wav')
    $words = [RelicAudio]::Generate($Voice, $prefix + $story.text, $file)
    $duration = ([System.IO.FileInfo]$file).Length / 32000
    $timings[$story.id] = @{ bodyOffset = $prefix.Length; duration = [Math]::Round($duration, 2); words = $words }
    Write-Output ($story.id + ': ' + [Math]::Round($duration, 1) + ' s')
  }
  $timings | ConvertTo-Json -Depth 8 | Set-Content -LiteralPath (Join-Path $audioRoot 'timings.json') -Encoding UTF8
  Remove-Item -LiteralPath (Join-Path $projectRoot '2/audio-source.json')
} finally { Pop-Location }
