using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace CleanNinja.Server.Migrations
{
    /// <inheritdoc />
    public partial class AddIsSlotBasedToService : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<bool>(
                name: "IsSlotBased",
                table: "Services",
                type: "bit",
                nullable: false,
                defaultValue: false);

            migrationBuilder.AddColumn<string>(
                name: "CustomerEmail",
                table: "Bookings",
                type: "nvarchar(max)",
                nullable: false,
                defaultValue: "");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "IsSlotBased",
                table: "Services");

            migrationBuilder.DropColumn(
                name: "CustomerEmail",
                table: "Bookings");
        }
    }
}
