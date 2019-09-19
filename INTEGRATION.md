# Integration Testing

Because workitem is deeply integrated with git, it makes sense to test in a sandbox away from the workitem repository which is itself a git repository.

`docker run -it -v D:\repos\workitem\:/app node bash -c "cd /tmp && node /app/dist/cli.js init +git"`