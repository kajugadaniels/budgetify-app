import 'package:flutter/material.dart';

import '../../../../core/theme/app_colors.dart';
import '../../../../core/widgets/glass_panel.dart';
import '../../../../core/widgets/skeleton_loader.dart';
import 'auth_footer_links.dart';

class AuthLayout extends StatelessWidget {
  const AuthLayout({super.key, required this.child, this.preview});

  final Widget child;
  final Widget? preview;

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      body: DecoratedBox(
        decoration: const _AuthBackgroundDecoration(),
        child: SafeArea(
          child: Center(
            child: ConstrainedBox(
              constraints: const BoxConstraints(maxWidth: 1320),
              child: Padding(
                padding: const EdgeInsets.fromLTRB(24, 20, 24, 24),
                child: Column(
                  children: [
                    const _AuthHeader(),
                    const SizedBox(height: 24),
                    Expanded(
                      child: LayoutBuilder(
                        builder: (context, constraints) {
                          final isWide = constraints.maxWidth >= 1040;

                          if (isWide) {
                            return Row(
                              children: [
                                Expanded(child: _BrandPanel(preview: preview)),
                                const SizedBox(width: 28),
                                Expanded(
                                  child: Align(
                                    alignment: Alignment.centerRight,
                                    child: _FormPanel(child: child),
                                  ),
                                ),
                              ],
                            );
                          }

                          return SingleChildScrollView(
                            child: Column(
                              children: [
                                _BrandPanel(compact: true, preview: preview),
                                const SizedBox(height: 24),
                                _FormPanel(child: child),
                              ],
                            ),
                          );
                        },
                      ),
                    ),
                    const SizedBox(height: 18),
                    const AuthFooterLinks(),
                  ],
                ),
              ),
            ),
          ),
        ),
      ),
    );
  }
}

class _AuthHeader extends StatelessWidget {
  const _AuthHeader();

  @override
  Widget build(BuildContext context) {
    return Row(
      children: [
        const GlassBadge(
          padding: EdgeInsets.all(10),
          child: Icon(
            Icons.account_balance_wallet_rounded,
            color: AppColors.primary,
          ),
        ),
        const SizedBox(width: 14),
        Text(
          'Budgetify',
          style: Theme.of(context).textTheme.titleLarge?.copyWith(
            fontSize: 28,
            color: AppColors.textPrimary,
          ),
        ),
      ],
    );
  }
}

class _BrandPanel extends StatelessWidget {
  const _BrandPanel({this.compact = false, this.preview});

  final bool compact;
  final Widget? preview;

  @override
  Widget build(BuildContext context) {
    final previewSection = compact
        ? AspectRatio(
            aspectRatio: 1.18,
            child: preview ?? const _PreviewSurface(),
          )
        : Expanded(child: preview ?? const _PreviewSurface());

    return GlassPanel(
      padding: EdgeInsets.all(compact ? 22 : 30),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        mainAxisAlignment: MainAxisAlignment.center,
        children: [
          Text(
            'Financial command center',
            style: Theme.of(context).textTheme.headlineLarge?.copyWith(
              fontSize: compact ? 30 : 48,
              height: 1.05,
            ),
          ),
          const SizedBox(height: 16),
          Text(
            'A refined sign-in experience with a focused, glass-based interface for secure access.',
            style: Theme.of(
              context,
            ).textTheme.bodyLarge?.copyWith(fontSize: compact ? 15 : 17),
          ),
          const SizedBox(height: 24),
          previewSection,
        ],
      ),
    );
  }
}

class _FormPanel extends StatelessWidget {
  const _FormPanel({required this.child});

  final Widget child;

  @override
  Widget build(BuildContext context) {
    return ConstrainedBox(
      constraints: const BoxConstraints(maxWidth: 520),
      child: GlassPanel(padding: const EdgeInsets.all(28), child: child),
    );
  }
}

class _AuthBackgroundDecoration extends Decoration {
  const _AuthBackgroundDecoration();

  @override
  BoxPainter createBoxPainter([VoidCallback? onChanged]) {
    return _AuthBackgroundPainter();
  }
}

class _AuthBackgroundPainter extends BoxPainter {
  @override
  void paint(Canvas canvas, Offset offset, ImageConfiguration configuration) {
    final size = configuration.size;
    if (size == null) {
      return;
    }

    final rect = offset & size;
    final paint = Paint()
      ..shader = const LinearGradient(
        begin: Alignment.topLeft,
        end: Alignment.bottomRight,
        colors: [AppColors.background, Color(0xFF0D1116), Color(0xFF131922)],
      ).createShader(rect);
    canvas.drawRect(rect, paint);

    final accentPaint = Paint()
      ..color = AppColors.primary.withValues(alpha: 0.08);
    canvas.drawCircle(
      Offset(offset.dx + size.width * 0.2, offset.dy + size.height * 0.18),
      size.shortestSide * 0.2,
      accentPaint,
    );
    canvas.drawCircle(
      Offset(offset.dx + size.width * 0.82, offset.dy + size.height * 0.78),
      size.shortestSide * 0.28,
      Paint()..color = Colors.white.withValues(alpha: 0.04),
    );
  }
}

class _PreviewSurface extends StatelessWidget {
  const _PreviewSurface();

  @override
  Widget build(BuildContext context) {
    return SkeletonLoader(
      child: Column(
        children: [
          Expanded(
            child: Row(
              children: [
                Expanded(
                  flex: 7,
                  child: GlassPanel(
                    borderRadius: BorderRadius.circular(28),
                    padding: const EdgeInsets.all(22),
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: const [
                        SkeletonBox(width: 140, height: 18),
                        SizedBox(height: 18),
                        SkeletonBox(height: 140, radius: 24),
                        SizedBox(height: 18),
                        SkeletonBox(width: 180, height: 18),
                        SizedBox(height: 12),
                        SkeletonBox(height: 14),
                        SizedBox(height: 10),
                        SkeletonBox(width: 220, height: 14),
                      ],
                    ),
                  ),
                ),
                const SizedBox(width: 16),
                Expanded(
                  flex: 5,
                  child: Column(
                    children: [
                      Expanded(
                        child: GlassPanel(
                          borderRadius: BorderRadius.circular(28),
                          padding: const EdgeInsets.all(20),
                          child: Column(
                            crossAxisAlignment: CrossAxisAlignment.start,
                            children: const [
                              SkeletonBox(width: 90, height: 16),
                              SizedBox(height: 16),
                              SkeletonBox(height: 74, radius: 20),
                              SizedBox(height: 12),
                              SkeletonBox(width: 110, height: 14),
                            ],
                          ),
                        ),
                      ),
                      const SizedBox(height: 16),
                      Expanded(
                        child: GlassPanel(
                          borderRadius: BorderRadius.circular(28),
                          padding: const EdgeInsets.all(20),
                          child: Column(
                            children: const [
                              SkeletonBox(height: 14, width: 110),
                              SizedBox(height: 16),
                              SkeletonBox(height: 14),
                              SizedBox(height: 10),
                              SkeletonBox(height: 14),
                              SizedBox(height: 10),
                              SkeletonBox(height: 14, width: 140),
                            ],
                          ),
                        ),
                      ),
                    ],
                  ),
                ),
              ],
            ),
          ),
          const SizedBox(height: 16),
          const GlassPanel(
            borderRadius: BorderRadius.all(Radius.circular(24)),
            padding: EdgeInsets.all(18),
            child: Row(
              children: [
                SkeletonBox(width: 42, height: 42, radius: 14),
                SizedBox(width: 14),
                Expanded(child: SkeletonBox(height: 14)),
              ],
            ),
          ),
        ],
      ),
    );
  }
}
