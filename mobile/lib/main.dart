   import 'package:flutter/material.dart';
   import 'screens/home_screen.dart';
   import 'screens/login_screen.dart';
   import 'services/auth_service.dart';

   void main() async {
     WidgetsFlutterBinding.ensureInitialized();
     final loggedIn = await AuthService().hasToken();
     runApp(MyApp(loggedIn: loggedIn));
   }

   class MyApp extends StatelessWidget {
     final bool loggedIn;
     const MyApp({super.key, required this.loggedIn});

     @override
     Widget build(BuildContext context) {
       return MaterialApp(
         title: 'Stock Portfolio',
         theme: ThemeData(colorSchemeSeed: Colors.green, useMaterial3: true),
         home: loggedIn ? const HomeScreen() : const LoginScreen(),
       );
     }
   }