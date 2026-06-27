$urls = @{
    "beach"   = "https://upload.wikimedia.org/wikipedia/commons/d/d7/Ocean_waves.ogg"
    "office"  = "https://upload.wikimedia.org/wikipedia/commons/5/5f/Office_ambience.ogg"
    "space"   = "https://upload.wikimedia.org/wikipedia/commons/3/36/Space_Ship_Engine_Sound.ogg"
    "metro"   = "https://upload.wikimedia.org/wikipedia/commons/4/4b/Subway_train_arriving.ogg"
    "chai"    = "https://upload.wikimedia.org/wikipedia/commons/c/c8/Coffee_shop_ambience.ogg"
    "library" = "https://upload.wikimedia.org/wikipedia/commons/b/b5/Rain_on_a_tin_roof.ogg"
    "park"    = "https://upload.wikimedia.org/wikipedia/commons/8/87/Birds_singing_in_the_forest.ogg"
}

New-Item -ItemType Directory -Force -Path "public/audio"

foreach ($key in $urls.Keys) {
    $url = $urls[$key]
    $oggPath = "public/audio/${key}.ogg"
    $mp3Path = "public/audio/${key}.mp3"
    
    Write-Host "Downloading $key from $url"
    curl.exe -s -L -A "Puffbreak/1.0 (Mozilla/5.0)" $url -o $oggPath
    
    if (Test-Path $oggPath) {
        Write-Host "Converting $key to MP3"
        ffmpeg.exe -y -v warning -i $oggPath -codec:a libmp3lame -qscale:a 2 $mp3Path
        Remove-Item $oggPath
    } else {
        Write-Host "Failed to download $key"
    }
    
    Start-Sleep -Seconds 2
}
Write-Host "Done downloading all ambient files."
