   import 'dart:async';
   import 'package:flutter/material.dart';
   import '../models/stock.dart';
   import '../services/auth_service.dart';
   import '../services/stock_service.dart';
   import 'login_screen.dart';

   class HomeScreen extends StatefulWidget {
     const HomeScreen({super.key});

     @override
     State<HomeScreen> createState() => _HomeScreenState();
   }

   class _HomeScreenState extends State<HomeScreen> {
     final _service = StockService();
     final _auth = AuthService();
     final _searchController = TextEditingController();
     Timer? _debounce;

     List<Stock> _stocks = [];
     bool _loading = true;
     String? _error;

     @override
     void initState() {
       super.initState();
       _load();
     }

     Future<void> _load() async {
       setState(() {
         _loading = true;
         _error = null;
       });
       try {
         final stocks =
             await _service.getStocks(query: _searchController.text.trim());
         if (!mounted) return;
         setState(() => _stocks = stocks);
       } catch (e) {
         if (!mounted) return;
         setState(() => _error = e.toString().replaceFirst('Exception: ', ''));
       } finally {
         if (mounted) setState(() => _loading = false);
       }
     }

     // รอผู้ใช้หยุดพิมพ์ 400ms ค่อยยิง API
     void _onSearchChanged(String _) {
       _debounce?.cancel();
       _debounce = Timer(const Duration(milliseconds: 400), _load);
     }

     Future<void> _logout() async {
       await _auth.logout();
       if (!mounted) return;
       Navigator.pushReplacement(
         context,
         MaterialPageRoute(builder: (_) => const LoginScreen()),
       );
     }

     @override
     void dispose() {
       _debounce?.cancel();
       _searchController.dispose();
       super.dispose();
     }

     Widget _buildBody() {
       if (_error != null) {
         return Center(
           child: Column(
             mainAxisSize: MainAxisSize.min,
             children: [
               Text(_error!, style: const TextStyle(color: Colors.red)),
               const SizedBox(height: 12),
               ElevatedButton(onPressed: _load, child: const Text('Retry')),
             ],
           ),
         );
       }
       if (!_loading && _stocks.isEmpty) {
         return const Center(child: Text('No stocks found'));
       }
       return RefreshIndicator(
         onRefresh: _load,
         child: ListView.separated(
           itemCount: _stocks.length,
           separatorBuilder: (_, _) => const Divider(height: 1),
           itemBuilder: (context, i) {
             final s = _stocks[i];
             return ListTile(
               leading: CircleAvatar(child: Text(s.symbol[0])),
               title: Text(s.symbol,
                   style: const TextStyle(fontWeight: FontWeight.bold)),
               subtitle: Text(s.name),
               trailing: Text('\$${s.price.toStringAsFixed(2)}',
                   style: const TextStyle(fontSize: 16)),
             );
           },
         ),
       );
     }

     @override
     Widget build(BuildContext context) {
       return Scaffold(
         appBar: AppBar(
           title: const Text('Stocks'),
           actions: [
             IconButton(
               icon: const Icon(Icons.logout),
               tooltip: 'Logout',
               onPressed: _logout,
             ),
           ],
         ),
         body: Column(
           children: [
             Padding(
               padding: const EdgeInsets.all(12),
               child: TextField(
                 controller: _searchController,
                 onChanged: _onSearchChanged,
                 decoration: const InputDecoration(
                   hintText: 'Search symbol or name',
                   prefixIcon: Icon(Icons.search),
                   border: OutlineInputBorder(),
                 ),
               ),
             ),
             if (_loading) const LinearProgressIndicator(),
             Expanded(child: _buildBody()),
           ],
         ),
       );
     }
   }