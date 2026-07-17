using ControleGastos.Api.Data;
using ControleGastos.Api.DTOs.Totals;
using ControleGastos.Api.Enums;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace ControleGastos.Api.Controllers;

[ApiController]
[Route("api/[controller]")]
public class TotalsController : ControllerBase
{
    private readonly AppDbContext _context;

    public TotalsController(AppDbContext context)
    {
        _context = context;
    }

    /// <summary>
    /// Lista todas as pessoas com seus respectivos totais de receitas,
    /// despesas e saldo, além dos totais gerais da residência.
    /// </summary>
    [HttpGet]
    public async Task<ActionResult<TotalsResponse>> GetTotals()
    {
        var people = await _context.People
            .AsNoTracking()
            .OrderBy(person => person.Name)
            .Select(person => new PersonTotalsResponse
            {
                PersonId = person.Id,
                PersonName = person.Name,

                TotalIncome = _context.Transactions
                    .Where(transaction =>
                        transaction.PersonId == person.Id &&
                        transaction.Type == TransactionType.Income)
                    .Sum(transaction => (decimal?)transaction.Amount) ?? 0,

                TotalExpense = _context.Transactions
                    .Where(transaction =>
                        transaction.PersonId == person.Id &&
                        transaction.Type == TransactionType.Expense)
                    .Sum(transaction => (decimal?)transaction.Amount) ?? 0
            })
            .ToListAsync();

        foreach (var person in people)
        {
            person.Balance = person.TotalIncome - person.TotalExpense;
        }

        var response = new TotalsResponse
        {
            People = people,
            TotalIncome = people.Sum(person => person.TotalIncome),
            TotalExpense = people.Sum(person => person.TotalExpense)
        };

        response.NetBalance = response.TotalIncome - response.TotalExpense;

        return Ok(response);
    }
}