require 'yaml'
require 'byebug'

sprites = YAML.load_file('sprites.yml')

sprites.each do |key, value|
  puts "#{key}, #{value}"
  `convert -pointsize 28 -background transparent -font "/Users/$(whoami)/Library/Fonts/Hack-Regular.ttf" label:"#{value}" assets/#{key}.png`
end

