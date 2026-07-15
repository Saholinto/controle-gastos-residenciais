using ControleGastos.Api.Models;
using Microsoft.EntityFrameworkCore;

namespace ControleGastos.Api.Data;

/// <summary>
/// Responsável pelo acesso ao banco de dados da aplicação.
/// </summary>
public class AppDbContext(DbContextOptions<AppDbContext> options)
    : DbContext(options)
{
    public DbSet<Person> People => Set<Person>();

    public DbSet<FinancialTransaction> Transactions
        => Set<FinancialTransaction>();

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        base.OnModelCreating(modelBuilder);

        modelBuilder.Entity<Person>(entity =>
        {
            entity.ToTable("People");

            entity.HasKey(person => person.Id);

            entity.Property(person => person.Name)
                .IsRequired()
                .HasMaxLength(100);

            entity.Property(person => person.Age)
                .IsRequired();

            entity.HasMany(person => person.Transactions)
                .WithOne(transaction => transaction.Person)
                .HasForeignKey(transaction => transaction.PersonId)
                .OnDelete(DeleteBehavior.Cascade);
        });

        modelBuilder.Entity<FinancialTransaction>(entity =>
        {
            entity.ToTable("Transactions");

            entity.HasKey(transaction => transaction.Id);

            entity.Property(transaction => transaction.Description)
                .IsRequired()
                .HasMaxLength(200);

            entity.Property(transaction => transaction.Amount)
                .IsRequired();

            entity.Property(transaction => transaction.Type)
                .IsRequired();
        });
    }
}