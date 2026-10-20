from django.core.management.base import BaseCommand, CommandError
from django.contrib.auth.models import User
from django.db import transaction
from accounts.models import UserProfile


class Command(BaseCommand):
    help = "Promote an existing user to the verified 'owner' role for MilletMarg store management."

    def add_arguments(self, parser):
        parser.add_argument("username", type=str, help="Username or email of the user to promote.")
        parser.add_argument(
            "--revoke",
            action="store_true",
            help="Demote user back to 'customer' role instead of promoting to owner."
        )

    def handle(self, *args, **options):
        identifier = options["username"]
        revoke = options.get("revoke", False)

        user = User.objects.filter(username=identifier).first() or User.objects.filter(email=identifier).first()
        if not user:
            raise CommandError(f"User '{identifier}' not found in database.")

        with transaction.atomic():
            profile, _ = UserProfile.objects.get_or_create(user=user)
            target_role = UserProfile.ROLE_CUSTOMER if revoke else UserProfile.ROLE_OWNER
            old_role = profile.role

            if old_role == target_role:
                self.stdout.write(
                    self.style.WARNING(
                        f"User '{user.username}' (id: {user.id}) is already in role '{target_role}'."
                    )
                )
                return

            profile.role = target_role
            profile.save(update_fields=["role", "updated_at"])

            action_str = "demoted to 'customer'" if revoke else "promoted to 'owner'"
            self.stdout.write(
                self.style.SUCCESS(
                    f"Successfully {action_str} user '{user.username}' (email: {user.email or 'N/A'})."
                )
            )
