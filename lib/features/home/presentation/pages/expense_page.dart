import 'package:flutter/material.dart';
import 'package:hugeicons/hugeicons.dart';

import '../widgets/section_elements.dart';

class ExpensePage extends StatelessWidget {
  const ExpensePage({super.key});

  @override
  Widget build(BuildContext context) {
    return const SectionPanel(
      badgeLabel: 'Expense workspace',
      badgeIcon: HugeIcons.strokeRoundedWallet02,
      title: 'Expense',
      description:
          'Understand where your money goes with clean categorization and spending visibility.',
      children: [
        SizedBox(height: 24),
        Wrap(
          spacing: 12,
          runSpacing: 12,
          children: [
            SectionMetricChip(
              icon: HugeIcons.strokeRoundedInvoice01,
              label: 'Transactions',
              value: 'Ready to capture',
            ),
            SectionMetricChip(
              icon: HugeIcons.strokeRoundedTag01,
              label: 'Categories',
              value: 'Prepared',
            ),
            SectionMetricChip(
              icon: HugeIcons.strokeRoundedAnalyticsUp,
              label: 'Spending trends',
              value: 'Planned',
            ),
          ],
        ),
        SizedBox(height: 24),
        SectionSummaryCard(
          icon: HugeIcons.strokeRoundedReceiptDollar,
          title: 'Upcoming focus',
          description:
              'Add expense tracking, smart categories, and comparison views that make spending patterns obvious.',
        ),
      ],
    );
  }
}
