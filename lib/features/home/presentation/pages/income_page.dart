import 'package:flutter/material.dart';
import 'package:hugeicons/hugeicons.dart';

import '../widgets/section_elements.dart';

class IncomePage extends StatelessWidget {
  const IncomePage({super.key});

  @override
  Widget build(BuildContext context) {
    return const SectionPanel(
      badgeLabel: 'Income workspace',
      badgeIcon: HugeIcons.strokeRoundedMoneyReceiveCircle,
      title: 'Income',
      description:
          'Track salaries, side income, and recurring inflows in one calm workspace.',
      children: [
        SizedBox(height: 24),
        Wrap(
          spacing: 12,
          runSpacing: 12,
          children: [
            SectionMetricChip(
              icon: HugeIcons.strokeRoundedArrowDown01,
              label: 'Recurring inflows',
              value: 'Ready to configure',
            ),
            SectionMetricChip(
              icon: HugeIcons.strokeRoundedChartUp,
              label: 'Cashflow insights',
              value: 'Planned',
            ),
            SectionMetricChip(
              icon: HugeIcons.strokeRoundedCalendar03,
              label: 'Monthly tracking',
              value: 'Prepared',
            ),
          ],
        ),
        SizedBox(height: 24),
        SectionSummaryCard(
          icon: HugeIcons.strokeRoundedWalletAdd01,
          title: 'Upcoming focus',
          description:
              'Build recurring income streams, source tagging, and clean cashflow reporting from this section.',
        ),
      ],
    );
  }
}
