import 'package:flutter/material.dart';
import 'package:hugeicons/hugeicons.dart';

import '../../../../core/theme/app_colors.dart';
import '../../../../core/widgets/glass_panel.dart';
import 'app_layout_section.dart';

class AppBottomNavBar extends StatelessWidget {
  const AppBottomNavBar({
    super.key,
    required this.currentSection,
    required this.destinations,
    required this.onSectionSelected,
  });

  final AppLayoutSection currentSection;
  final List<AppNavDestination> destinations;
  final ValueChanged<AppLayoutSection> onSectionSelected;

  @override
  Widget build(BuildContext context) {
    final isCompact = MediaQuery.sizeOf(context).width < 900;

    return GlassPanel(
      borderRadius: BorderRadius.circular(30),
      blur: 24,
      opacity: 0.12,
      padding: EdgeInsets.symmetric(
        horizontal: isCompact ? 10 : 12,
        vertical: isCompact ? 8 : 10,
      ),
      child: SingleChildScrollView(
        scrollDirection: Axis.horizontal,
        child: Row(
          children: destinations
              .map(
                (destination) => Padding(
                  padding: const EdgeInsets.symmetric(horizontal: 4),
                  child: _BottomNavItem(
                    destination: destination,
                    isSelected: destination.section == currentSection,
                    onTap: () => onSectionSelected(destination.section),
                  ),
                ),
              )
              .toList(),
        ),
      ),
    );
  }
}

class _BottomNavItem extends StatelessWidget {
  const _BottomNavItem({
    required this.destination,
    required this.isSelected,
    required this.onTap,
  });

  final AppNavDestination destination;
  final bool isSelected;
  final VoidCallback onTap;

  @override
  Widget build(BuildContext context) {
    final highlight = AppColors.primary.withValues(alpha: 0.16);

    return Material(
      color: Colors.transparent,
      child: InkWell(
        borderRadius: BorderRadius.circular(22),
        onTap: onTap,
        child: AnimatedContainer(
          duration: const Duration(milliseconds: 220),
          curve: Curves.easeOutCubic,
          padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 10),
          decoration: BoxDecoration(
            borderRadius: BorderRadius.circular(22),
            color: isSelected ? highlight : Colors.transparent,
            border: Border.all(
              color: isSelected
                  ? AppColors.primary.withValues(alpha: 0.28)
                  : Colors.white.withValues(alpha: 0.06),
            ),
          ),
          child: Row(
            mainAxisSize: MainAxisSize.min,
            children: [
              HugeIcon(
                icon: destination.icon,
                size: 18,
                color: isSelected
                    ? AppColors.primary
                    : AppColors.textSecondary.withValues(alpha: 0.9),
                strokeWidth: 1.8,
              ),
              const SizedBox(width: 8),
              Text(
                destination.label,
                style: TextStyle(
                  fontSize: 12,
                  fontWeight: isSelected ? FontWeight.w800 : FontWeight.w600,
                  color: isSelected
                      ? AppColors.textPrimary
                      : AppColors.textSecondary,
                ),
              ),
            ],
          ),
        ),
      ),
    );
  }
}
