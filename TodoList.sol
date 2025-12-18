// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

contract TodoList {
    struct Task {
        string content;   
        bool completed;     
    }

    Task[] public tasks;

    address public owner;

    event TaskCreated(uint indexed taskId, string content);
    event TaskCompleted(uint indexed taskId, bool completed);

    constructor() {
        owner = msg.sender;
        createTask("My first task!");
    }

    function createTask(string memory _content) public {
        require(bytes(_content).length > 0, "Task cant be empty");
        tasks.push(Task({
            content: _content,
            completed: false
        }));
        emit TaskCreated(tasks.length - 1, _content);
    }


    function toggleCompleted(uint _taskId) public {
        require(_taskId < tasks.length, "No task with such ID");
        tasks[_taskId].completed = !tasks[_taskId].completed;
        emit TaskCompleted(_taskId, tasks[_taskId].completed);
    }

    function getTaskCount() public view returns (uint) {
        return tasks.length;
    }

    function getTask(uint _taskId) public view returns (string memory content, bool completed) {
        require(_taskId < tasks.length, "No task with such ID");
        Task storage task = tasks[_taskId];
        return (task.content, task.completed);
    }
}