class Stock{
  final int id;
  final String symbol;
  final String name;
  final double price;


Stock({
  required this.id,
  required this.symbol,
  required this.name,
  required this.price,
});

factory Stock.fromJson(
  Map<String, dynamic> json) => Stock(
  id: json['id'],
  symbol: json['symbol'],
  name: json['name'],
  price: double.parse(json['price'].toString()),
  );
}