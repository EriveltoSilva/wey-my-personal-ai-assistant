Perfeito. Vamos projetar a modelagem **backend** de uma aplicação inspirada no **Microsoft Copilot (vertente de agents)** com foco em agentes selecionáveis e interações de chat com histórico.

---

## 🎯 **Objetivo da aplicação**

Permitir que usuários interajam com múltiplos **agentes inteligentes (AI agents)**, podendo selecionar um agente e manter sessões de conversas, com histórico completo das interações.

---

## 🧱 **Principais Entidades e Funcionalidades**

### 1. **Usuário (User)**

* Representa o cliente final.
* Pode ter múltiplos chats com diferentes agentes.

### 2. **Agente (Agent)**

* Representa um assistente com comportamento configurado (ex: "Especialista em Marketing", "Bot Financeiro", etc).
* Pode ser parametrizado (ex: sistema de personalidade, conhecimento base, ferramentas).

### 3. **Chat**

* Sessão de conversa entre um usuário e um agente específico.
* Contém metadados como data de início, título, status (ativo/finalizado).

### 4. **Mensagem (Message)**

* Contém cada entrada (usuário ou agente).
* Salva o histórico da conversa.

---

## 🧩 **Modelagem de Dados (Simplificada)**

Formato agnóstico de banco (pode ser adaptado para SQL, NoSQL ou ORM como Django, Prisma, Sequelize, etc.)

### 🧑‍💼 `User`

```ts
id: UUID
name: string
email: string
password_hash: string
created_at: datetime
```

---

### 🤖 `Agent`

```ts
id: UUID
name: string                  // Ex: "Agente Financeiro"
description: string           // Ex: "Especialista em finanças pessoais"
system_prompt: text           // Prompt base do agente
avatar_url: string            // Foto ou ícone do agente
model_name: string            // Ex: gpt-4o, llama3, etc
tools_enabled: JSON           // Ferramentas específicas (ex: pesquisa, calculadora)
created_at: datetime
```

---

### 💬 `Chat`

```ts
id: UUID
user_id: FK(User)
agent_id: FK(Agent)
title: string                 // Ex: "Planejamento financeiro"
status: string                // active, archived
created_at: datetime
updated_at: datetime
```

---

### 🗨️ `Message`

```ts
id: UUID
chat_id: FK(Chat)
sender: enum("user", "agent")
content: text
metadata: JSON                // tempo de resposta, tokens, etc.
created_at: datetime
```

---

## 🔁 **Fluxo de Interação**

1. **Usuário entra na aplicação** → login
2. **Escolhe um agente** → `/agents/:id`
3. **Cria um chat com aquele agente** → `/chats/`
4. **Envia mensagens** → `/chats/:id/messages`
5. **Backend responde com mensagem do agente** (via API da LLM ou modelo local)
6. **Chat e mensagens são persistidos** → histórico visível a qualquer momento

---

## 📦 **Principais Endpoints (RESTful ou GraphQL)**

### Auth

* `POST /auth/register`
* `POST /auth/login`

### Agentes

* `GET /agents/`
* `GET /agents/:id`
* `POST /agents/` *(admin only)*
* `PUT /agents/:id`
* `DELETE /agents/:id`

### Chats

* `GET /chats/` *(listar chats do usuário)*
* `GET /chats/:id`
* `POST /chats/` *(criar novo chat com agente)*
* `PUT /chats/:id` *(editar título ou arquivar)*
* `DELETE /chats/:id`

### Mensagens

* `GET /chats/:id/messages`
* `POST /chats/:id/messages` *(enviar mensagem e receber resposta do agente)*

---

## 🛠️ Tecnologias Indicadas (stack backend)

| Camada               | Sugestões                                            |
| -------------------- | ---------------------------------------------------- |
| **Linguagem**        | Python (Django, FastAPI), Node.js (Express/Nest), Go |
| **Banco de Dados**   | PostgreSQL ou MongoDB                                |
| **IA/LLM**           | OpenAI API, Mistral, Hugging Face, Langchain         |
| **Filas (opcional)** | Celery / BullMQ para tarefas de resposta             |
| **Autenticação**     | JWT + Refresh Tokens                                 |
| **Armazenamento**    | S3/GCS para uploads (se necessário)                  |

---

## 📈 Futuras Extensões

* Treinamento de agentes customizados
* Multi-modal (voz, imagem)
* Upload de arquivos para contexto
* Permissões (compartilhamento de chats)
* WebSocket para chats em tempo real

---

Se quiser, posso te ajudar agora com:

1. Modelos SQL ou ORM (Django, Prisma, Sequelize)
2. Diagramas (ERD)
3. Estrutura de pastas
4. API contract (Swagger ou JSON format)
5. Setup inicial com autenticação

Qual o próximo passo que prefere seguir?



class OnboardingQuestionnaireDTO(BaseModel):
    """Data Transfer Object for user onboarding questionnaire."""

    professional_role: ProfessionalRoleEnum = Field(..., description="User's professional role")
    organization: Optional[str] = Field(None, max_length=200, description="User's organization")
    experience_level: ExperienceLevelEnum = Field(..., description="User's experience level")
    interest_area_ids: List[str] = Field(..., min_items=1, description="User's interest area IDs")
    preferred_interaction_style: InteractionStyleEnum = Field(..., description="Preferred interaction style")
    use_cases: Optional[List[str]] = Field(None, description="Specific use cases for AI agents")
    goals: Optional[str] = Field(None, max_length=1000, description="User's goals with AI agents")

    model_config = ConfigDict(
        from_attributes=True,
        json_schema_extra={
            "example": {
                "professional_role": "lawyer",
                "organization": "ABC Law Firm",
                "experience_level": "intermediate",
                "interest_area_ids": ["uuid1", "uuid2", "uuid3"],
                "preferred_interaction_style": "formal",
                "use_cases": ["Legal document review", "Case law research"],
                "goals": "Improve efficiency in legal research and document analysis",
            }
        },
    )



@router.post("/onboarding")
async def complete_onboarding(
    onboarding_data: OnboardingQuestionnaireDTO,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
) -> Dict[str, str]:
    """Complete user onboarding questionnaire."""
    return await UserService.complete_onboarding(str(current_user.id), onboarding_data, db)


# Onboarding and Professional Profile Methods
@staticmethod
async def complete_onboarding(
    user_id: str, onboarding_data: OnboardingQuestionnaireDTO, db: AsyncSession
) -> Dict[str, Any]:
    """Complete user onboarding questionnaire."""
    from src.users.interest_services import UserInterestService

    user = await db.get(User, user_id)
    if not user:
        raise NotFoundException("User not found")

    # Update professional profile fields
    user.professional_role = onboarding_data.professional_role.value
    user.organization = onboarding_data.organization
    user.experience_level = onboarding_data.experience_level.value
    user.preferred_interaction_style = onboarding_data.preferred_interaction_style.value

    # Set user interests using normalized model
    await UserInterestService.set_user_interests(db, user_id, onboarding_data.interest_area_ids, default_priority=3)

    # Store full onboarding data (for historical purposes)
    onboarding_json = {
        "professional_role": onboarding_data.professional_role.value,
        "organization": onboarding_data.organization,
        "experience_level": onboarding_data.experience_level.value,
        "interest_area_ids": onboarding_data.interest_area_ids,
        "preferred_interaction_style": onboarding_data.preferred_interaction_style.value,
        "use_cases": onboarding_data.use_cases,
        "goals": onboarding_data.goals,
        "completed_at": str(datetime.now()),
    }
    user.onboarding_data = json.dumps(onboarding_json)
    user.onboarding_completed = True

    await db.commit()
    await db.refresh(user)

    return {"message": "Onboarding completed successfully", "professional_profile": user.get_professional_profile()}



# Professional Profile and Onboarding Endpoints
@router.post("/me/onboarding", status_code=status.HTTP_200_OK)
async def complete_onboarding(
    onboarding_data: Annotated[OnboardingQuestionnaireDTO, Body()],
    db: db_dependency,
    current_user: auth_user_dependency,
):
    """Complete user onboarding questionnaire."""
    return await UserService.complete_onboarding(user_id=current_user.id, onboarding_data=onboarding_data, db=db)


@router.get("/me/onboarding-status", status_code=status.HTTP_200_OK)
async def get_onboarding_status(db: db_dependency, current_user: auth_user_dependency):
    """Get user onboarding completion status."""
    return {
        "onboarding_completed": current_user.onboarding_completed,
        "professional_profile": current_user.get_professional_profile(),
    }


@router.put("/me/professional-profile", status_code=status.HTTP_200_OK)
async def update_professional_profile(
    profile_data: Annotated[UserProfessionalProfileUpdateDTO, Body()],
    db: db_dependency,
    current_user: auth_user_dependency,
):
    """Update user professional profile."""
    return await UserService.update_professional_profile(user_id=current_user.id, profile_data=profile_data, db=db)


@router.get("/me/professional-profile", status_code=status.HTTP_200_OK)
async def get_professional_profile(db: db_dependency, current_user: auth_user_dependency):
    """Get user professional profile."""
    return current_user.get_professional_profile()
