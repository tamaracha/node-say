function [ data, fs ] = speak(text, ip)
  url = strcat([ 'http://', ip, ':3000/speak' ]);
  body.text = text;
  body.voice = 'Anna';
  opts = weboptions('MediaType', 'application/json');
  data = webwrite(url, body, opts);
  fs = 48000;
  sound(data, fs);
end
