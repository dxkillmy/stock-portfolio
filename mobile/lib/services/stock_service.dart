   import 'package:dio/dio.dart';
   import '../models/stock.dart';
   import 'api_client.dart';

   class StockService {
     Future<List<Stock>> getStocks({String? query}) async {
       try {
         final res = await dio.get('/stocks', queryParameters: {
           if (query != null && query.isNotEmpty) 'q': query,
         });
         return (res.data as List).map((e) => Stock.fromJson(e)).toList();
       } on DioException catch (e) {
         final data = e.response?.data;
         throw Exception(data is Map ? data['error'] : 'Cannot connect to server');
       }
     }
   }