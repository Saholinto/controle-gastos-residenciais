using ControleGastos.Api.Data;
using ControleGastos.Api.DTOs.People;
using ControleGastos.Api.Models;
using Microsoft.EntityFrameworkCore;

namespace ControleGastos.Api.Services;

/// <summary>
/// Contém as regras e operações relacionadas ao cadastro de pessoas.
/// </summary>
public class PersonService
{
    private readonly AppDbContext _context;

    public PersonService(AppDbContext context)
    {
        _context = context;
    }

    /// <summary>
    /// Lista todas as pessoas cadastradas em ordem alfabética.
    /// </summary>
    public async Task<IReadOnlyList<PersonResponse>> GetAllAsync()
    {
        return await _context.People
            .AsNoTracking()
            .OrderBy(person => person.Name)
            .Select(person => new PersonResponse(
                person.Id,
                person.Name,
                person.Age))
            .ToListAsync();
    }

    /// <summary>
    /// Cadastra uma nova pessoa após normalizar os dados recebidos.
    /// </summary>
    public async Task<PersonResponse> CreateAsync(
        CreatePersonRequest request)
    {
        var person = new Person
        {
            Name = request.Name.Trim(),
            Age = request.Age
        };

        _context.People.Add(person);
        await _context.SaveChangesAsync();

        return new PersonResponse(
            person.Id,
            person.Name,
            person.Age);
    }

    /// <summary>
    /// Exclui uma pessoa. As transações relacionadas são removidas
    /// automaticamente pela exclusão em cascata configurada no banco.
    /// </summary>
    public async Task<bool> DeleteAsync(int id)
    {
        var person = await _context.People
            .FirstOrDefaultAsync(person => person.Id == id);

        if (person is null)
        {
            return false;
        }

        _context.People.Remove(person);
        await _context.SaveChangesAsync();

        return true;
    }
}