require 'yaml'
require 'byebug'

sprites = YAML.load_file('sprites.yml')


sprites.each do |key, value|
  puts "#{key}, #{value}"
  `convert -pointsize 32 -background transparent -font "/Users/sbinns/Library/Fonts/Hack-Regular.ttf" label:"#{value}" assets/#{key}.png`
end

