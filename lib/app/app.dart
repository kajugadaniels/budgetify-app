import 'package:flutter/material.dart';
import 'package:toastification/toastification.dart';

import '../core/theme/app_theme.dart';
import '../features/auth/presentation/pages/login_page.dart';

class BudgetifyApp extends StatelessWidget {
  const BudgetifyApp({super.key});

  @override
  Widget build(BuildContext context) {
    final theme = AppTheme.dark();

    return ToastificationWrapper(
      child: MaterialApp(
        title: 'Budgetify',
        debugShowCheckedModeBanner: false,
        theme: theme,
        darkTheme: theme,
        themeMode: ThemeMode.dark,
        home: const LoginPage(),
      ),
    );
  }
}
