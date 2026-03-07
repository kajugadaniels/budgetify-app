import 'package:flutter/material.dart';
import 'package:hugeicons/hugeicons.dart';

import '../../../auth/data/models/auth_user.dart';
import '../widgets/section_elements.dart';

class DashboardPage extends StatelessWidget {
  const DashboardPage({super.key, required this.user});

  final AuthUser user;

  @override
  Widget build(BuildContext context) {
    final userName = user.fullName ?? user.firstName ?? 'there';

    return SectionPanel(
      badgeLabel: 'Welcome back',
      badgeIcon: HugeIcons.strokeRoundedSparkles,
      title: 'Hi, $userName.',
      description:
          'Your Budgetify workspace is ready. You are signed in securely with Google and connected to the API.',
      children: [
        const SizedBox(height: 24),
        Wrap(
          spacing: 12,
          runSpacing: 12,
          children: [
            const SectionMetricChip(
              icon: HugeIcons.strokeRoundedCheckmarkBadge02,
              label: 'Session active',
              value: 'Authenticated',
            ),
            SectionMetricChip(
              icon: HugeIcons.strokeRoundedMail01,
              label: 'Primary email',
              value: user.email,
            ),
            SectionMetricChip(
              icon: HugeIcons.strokeRoundedShield01,
              label: 'Verification',
              value: user.isEmailVerified ? 'Verified' : 'Pending',
            ),
          ],
        ),
        const SizedBox(height: 24),
        const SectionSummaryCard(
          icon: HugeIcons.strokeRoundedWalletAdd01,
          title: 'Next step',
          description:
              'Start shaping the dashboard, budget accounts, and transaction flows from this signed-in state.',
        ),
      ],
    );
  }
}
